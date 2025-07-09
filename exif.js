// EXIF Data Extractor for Car Photography Portfolio
// Extracts real metadata from image files

class ExifExtractor {
    constructor() {
        this.cache = new Map();
    }

    async extractExifData(imageUrl) {
        // Check cache first
        if (this.cache.has(imageUrl)) {
            return this.cache.get(imageUrl);
        }

        try {
            // Fetch the image as ArrayBuffer
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const dataView = new DataView(arrayBuffer);

            // Check for JPEG format (0xFFD8)
            if (dataView.getUint16(0) !== 0xFFD8) {
                console.log('Not a JPEG file, cannot extract EXIF');
                return null;
            }

            // Find EXIF segment
            let offset = 2;
            while (offset < dataView.byteLength) {
                const marker = dataView.getUint16(offset);
                
                if (marker === 0xFFE1) { // EXIF marker
                    const exifData = this.parseExifSegment(dataView, offset);
                    this.cache.set(imageUrl, exifData);
                    return exifData;
                }
                
                // Move to next segment
                const segmentLength = dataView.getUint16(offset + 2);
                offset += 2 + segmentLength;
            }

            return null;
        } catch (error) {
            console.log('Error extracting EXIF:', error);
            return null;
        }
    }

    parseExifSegment(dataView, segmentOffset) {
        try {
            const segmentLength = dataView.getUint16(segmentOffset + 2);
            
            // Skip to EXIF identifier
            let offset = segmentOffset + 4;
            
            // Check for "Exif\0\0" identifier
            const exifId = String.fromCharCode(
                dataView.getUint8(offset),
                dataView.getUint8(offset + 1),
                dataView.getUint8(offset + 2),
                dataView.getUint8(offset + 3)
            );
            
            if (exifId !== 'Exif') {
                return null;
            }
            
            offset += 6; // Skip "Exif\0\0"
            
            // Check byte order (II for little-endian, MM for big-endian)
            const byteOrder = String.fromCharCode(
                dataView.getUint8(offset),
                dataView.getUint8(offset + 1)
            );
            
            const littleEndian = byteOrder === 'II';
            offset += 2;
            
            // Skip magic number (should be 42)
            offset += 2;
            
            // Get offset to first IFD
            const ifdOffset = this.getInt32(dataView, offset, littleEndian);
            offset += 4;
            
            // Parse IFD entries
            return this.parseIFD(dataView, offset - 8 + ifdOffset, littleEndian);
            
        } catch (error) {
            console.log('Error parsing EXIF segment:', error);
            return null;
        }
    }

    parseIFD(dataView, ifdOffset, littleEndian) {
        const exifData = {};
        
        try {
            const numEntries = this.getInt16(dataView, ifdOffset, littleEndian);
            let entryOffset = ifdOffset + 2;
            
            for (let i = 0; i < numEntries; i++) {
                const tag = this.getInt16(dataView, entryOffset, littleEndian);
                const type = this.getInt16(dataView, entryOffset + 2, littleEndian);
                const count = this.getInt32(dataView, entryOffset + 4, littleEndian);
                const valueOffset = entryOffset + 8;
                
                const value = this.getTagValue(dataView, tag, type, count, valueOffset, littleEndian);
                
                if (value !== null) {
                    const tagName = this.getTagName(tag);
                    if (tagName) {
                        exifData[tagName] = value;
                    }
                }
                
                entryOffset += 12;
            }
            
            return exifData;
        } catch (error) {
            console.log('Error parsing IFD:', error);
            return {};
        }
    }

    getTagValue(dataView, tag, type, count, valueOffset, littleEndian) {
        try {
            switch (type) {
                case 2: // ASCII string
                    if (count <= 4) {
                        let str = '';
                        for (let i = 0; i < count - 1; i++) {
                            str += String.fromCharCode(dataView.getUint8(valueOffset + i));
                        }
                        return str;
                    }
                    break;
                    
                case 3: // 16-bit unsigned integer
                    return this.getInt16(dataView, valueOffset, littleEndian);
                    
                case 4: // 32-bit unsigned integer
                    return this.getInt32(dataView, valueOffset, littleEndian);
                    
                case 5: // Rational (two 32-bit unsigned integers)
                    const numerator = this.getInt32(dataView, valueOffset, littleEndian);
                    const denominator = this.getInt32(dataView, valueOffset + 4, littleEndian);
                    return denominator !== 0 ? numerator / denominator : 0;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    getTagName(tag) {
        const tags = {
            // Basic EXIF tags
            0x010F: 'Make',
            0x0110: 'Model',
            0x0112: 'Orientation',
            0x011A: 'XResolution',
            0x011B: 'YResolution',
            0x0128: 'ResolutionUnit',
            0x0132: 'DateTime',
            0x013B: 'Artist',
            0x013E: 'WhitePoint',
            0x013F: 'PrimaryChromaticities',
            
            // Camera settings
            0x829A: 'ExposureTime',
            0x829D: 'FNumber',
            0x8822: 'ExposureProgram',
            0x8824: 'SpectralSensitivity',
            0x8827: 'ISO', // ISOSpeedRatings
            0x8828: 'OECF',
            0x8830: 'SensitivityType',
            0x8832: 'RecommendedExposureIndex',
            0x9000: 'ExifVersion',
            0x9003: 'DateTimeOriginal',
            0x9004: 'DateTimeDigitized',
            0x9101: 'ComponentsConfiguration',
            0x9102: 'CompressedBitsPerPixel',
            0x9201: 'ShutterSpeedValue',
            0x9202: 'ApertureValue',
            0x9203: 'BrightnessValue',
            0x9204: 'ExposureBiasValue',
            0x9205: 'MaxApertureValue',
            0x9206: 'SubjectDistance',
            0x9207: 'MeteringMode',
            0x9208: 'LightSource',
            0x9209: 'Flash',
            0x920A: 'FocalLength',
            0x920B: 'FlashEnergy',
            0x920C: 'SpatialFrequencyResponse',
            0x920D: 'Noise',
            0x920E: 'FocalPlaneXResolution',
            0x920F: 'FocalPlaneYResolution',
            0x9210: 'FocalPlaneResolutionUnit',
            0x9214: 'SubjectLocation',
            0x9215: 'ExposureIndex',
            0x9216: 'SensingMethod',
            0x9217: 'FileSource',
            0x9218: 'SceneType',
            0x9219: 'CFAPattern',
            0x921A: 'CustomRendered',
            0x921B: 'ExposureMode',
            0x921C: 'WhiteBalance',
            0x921D: 'DigitalZoomRatio',
            0x921E: 'FocalLengthIn35mmFilm',
            0x921F: 'SceneCaptureType',
            0x9220: 'GainControl',
            0x9221: 'Contrast',
            0x9222: 'Saturation',
            0x9223: 'Sharpness',
            0x9224: 'DeviceSettingDescription',
            0x9225: 'SubjectDistanceRange',
            0x9226: 'ImageUniqueID',
            0x9227: 'CameraOwnerName',
            0x9228: 'BodySerialNumber',
            0x9229: 'LensSpecification',
            0x922A: 'LensMake',
            0x922B: 'LensModel',
            0x922C: 'LensSerialNumber',
            
            // Sony-specific tags
            0x0001: 'SonyImageQuality',
            0x0003: 'SonyFlashExposureComp',
            0x0004: 'SonyTeleconverter',
            0x0010: 'SonyImageStabilization',
            0x0013: 'SonyBrightness',
            0x0014: 'SonyContrast',
            0x0015: 'SonySaturation',
            0x0016: 'SonySharpness',
            0x0017: 'SonyColorSpace',
            0x0018: 'SonySceneMode',
            0x001A: 'SonyZoneMatching',
            0x001B: 'SonyDynamicRangeOptimizer',
            0x001C: 'SonyImageStabilization2',
            0x001D: 'SonyLensID',
            0x001E: 'SonyMinoltaCameraSettings',
            0x0020: 'SonyColorMode',
            0x0021: 'SonyLensSpec',
            0x0022: 'SonyFullImageSize',
            0x0023: 'SonyPreviewImageSize',
            0x002E: 'SonyMacro',
            0x0030: 'SonyExposureMode',
            0x0031: 'SonyEdgeNoiseReduction',
            0x0032: 'SonyCreativeStyle',
            0x0039: 'SonyImageStabilization3',
            0x003C: 'SonyShutterCount',
            0x0048: 'SonyFlashMode',
            0x0049: 'SonyFlashLevel',
            0x004A: 'SonyReleaseMode',
            0x004B: 'SonySequenceNumber',
            0x0050: 'SonyAntiBlur',
            0x0051: 'SonyLongExposureNoiseReduction',
            0x0052: 'SonyDynamicRangeOptimizer2',
            0x0053: 'SonyIntelligentAuto',
            0x0054: 'SonyLensType2',
            0x0058: 'SonyHighISONoiseReduction2',
            
            // Lightroom/Adobe tags
            0x0001: 'LightroomVersion',
            0x0002: 'LightroomHasSettings',
            0x0003: 'LightroomHasCrop',
            0x0004: 'LightroomAlreadyApplied',
            
            // Additional common tags for better compatibility
            0x34665: 'ExifOffset', // Alternative EXIF offset
            0x8298: 'Copyright',
            0x8769: 'ExifOffset',
            0x8825: 'GPSOffset',
            0xA000: 'FlashpixVersion',
            0xA001: 'ColorSpace',
            0xA002: 'ExifImageWidth',
            0xA003: 'ExifImageHeight',
            0xA004: 'RelatedSoundFile',
            0xA005: 'ExifInteroperabilityOffset',
            0xA20E: 'FocalPlaneXResolution',
            0xA20F: 'FocalPlaneYResolution',
            0xA210: 'FocalPlaneResolutionUnit',
            0xA214: 'SubjectLocation',
            0xA215: 'ExposureIndex',
            0xA217: 'SensingMethod',
            0xA300: 'FileSource',
            0xA301: 'SceneType',
            0xA302: 'CFAPattern',
            0xA401: 'CustomRendered',
            0xA402: 'ExposureMode',
            0xA403: 'WhiteBalance',
            0xA404: 'DigitalZoomRatio',
            0xA405: 'FocalLengthIn35mmFilm',
            0xA406: 'SceneCaptureType',
            0xA407: 'GainControl',
            0xA408: 'Contrast',
            0xA409: 'Saturation',
            0xA40A: 'Sharpness',
            0xA40B: 'DeviceSettingDescription',
            0xA40C: 'SubjectDistanceRange',
            0xA420: 'ImageUniqueID',
            0xA430: 'CameraOwnerName',
            0xA431: 'BodySerialNumber',
            0xA432: 'LensSpecification',
            0xA433: 'LensMake',
            0xA434: 'LensModel',
            0xA435: 'LensSerialNumber',
            
            // GPS tags
            0x8825: 'GPSInfo'
        };
        
        return tags[tag] || null;
    }

    getInt16(dataView, offset, littleEndian) {
        return dataView.getUint16(offset, littleEndian);
    }

    getInt32(dataView, offset, littleEndian) {
        return dataView.getUint32(offset, littleEndian);
    }

    formatExifData(exifData, fallbackCamera) {
        console.log('📸 Formatting EXIF data:', exifData);
        console.log('🔧 Using fallback camera:', fallbackCamera);
        
        if (!exifData || Object.keys(exifData).length === 0) {
            console.log('⚠️ No EXIF data available, using fallback camera info');
            const fallbackFormatted = {};
            
            if (fallbackCamera) {
                if (fallbackCamera.make && fallbackCamera.model) {
                    fallbackFormatted['Camera'] = `${fallbackCamera.make} ${fallbackCamera.model}`;
                }
                if (fallbackCamera.lens) {
                    fallbackFormatted['Lens'] = fallbackCamera.lens;
                }
                if (fallbackCamera.photographer) {
                    fallbackFormatted['Photographer'] = fallbackCamera.photographer;
                }
            }
            
            return fallbackFormatted;
        }

        const formatted = {};

        // Camera info
        if (exifData.Make && exifData.Model) {
            formatted['Camera'] = `${exifData.Make} ${exifData.Model}`;
        } else if (fallbackCamera) {
            formatted['Camera'] = `${fallbackCamera.make} ${fallbackCamera.model}`;
        }

        // Lens info - try multiple sources
        if (exifData.LensModel) {
            formatted['Lens'] = exifData.LensModel;
        } else if (exifData.LensMake && exifData.LensModel) {
            formatted['Lens'] = `${exifData.LensMake} ${exifData.LensModel}`;
        } else if (fallbackCamera && fallbackCamera.lens) {
            formatted['Lens'] = fallbackCamera.lens;
        }

        // Exposure settings
        if (exifData.ExposureTime) {
            const exposure = exifData.ExposureTime;
            if (exposure < 1) {
                formatted['Shutter Speed'] = `1/${Math.round(1/exposure)}s`;
            } else {
                formatted['Shutter Speed'] = `${exposure}s`;
            }
        }

        if (exifData.FNumber) {
            formatted['Aperture'] = `f/${exifData.FNumber.toFixed(1)}`;
        }

        if (exifData.ISO) {
            formatted['ISO'] = `ISO ${exifData.ISO}`;
        }

        if (exifData.FocalLength) {
            formatted['Focal Length'] = `${Math.round(exifData.FocalLength)}mm`;
        }

        // 35mm equivalent focal length
        if (exifData.FocalLengthIn35mmFilm) {
            formatted['35mm Equivalent'] = `${exifData.FocalLengthIn35mmFilm}mm`;
        }

        // Additional camera settings
        if (exifData.WhiteBalance !== undefined) {
            const wbModes = ['Auto', 'Manual'];
            formatted['White Balance'] = wbModes[exifData.WhiteBalance] || 'Unknown';
        }

        if (exifData.ExposureMode !== undefined) {
            const expModes = ['Auto', 'Manual', 'Auto Bracket'];
            formatted['Exposure Mode'] = expModes[exifData.ExposureMode] || 'Unknown';
        }

        if (exifData.MeteringMode !== undefined) {
            const meteringModes = ['Unknown', 'Average', 'Center-weighted', 'Spot', 'Multi-spot', 'Multi-segment', 'Partial'];
            formatted['Metering'] = meteringModes[exifData.MeteringMode] || 'Unknown';
        }

        // Date/time
        if (exifData.DateTimeOriginal) {
            formatted['Date Taken'] = exifData.DateTimeOriginal;
        }

        // Photographer info
        if (exifData.Artist) {
            formatted['Photographer'] = exifData.Artist;
        } else if (exifData.CameraOwnerName) {
            formatted['Photographer'] = exifData.CameraOwnerName;
        } else if (fallbackCamera && fallbackCamera.photographer) {
            formatted['Photographer'] = fallbackCamera.photographer;
        }

        console.log('Formatted EXIF data:', formatted);
        return formatted;
    }
}

// Export for use in main script
window.ExifExtractor = ExifExtractor;
