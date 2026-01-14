# QR Scanner Troubleshooting Guide

## Common Scanner Issues and Solutions

### 1. Camera Permission Denied
**Error**: "Permission denied" or "Failed to start camera"

**Solutions**:
- Click "Allow" when the browser asks for camera permission
- Check your browser's camera settings
- Make sure no other app is using the camera
- Try refreshing the page and allowing permissions again

### 2. HTTPS Required
**Error**: "Camera access requires HTTPS or localhost"

**Solutions**:
- Make sure you're accessing the app via `https://` or `localhost`
- For development: Use `http://localhost:3000`
- For production: Deploy with HTTPS enabled

### 3. Camera Not Supported
**Error**: "Camera not supported on this device"

**Solutions**:
- Use a device with a camera (phone, tablet, laptop with webcam)
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Try a different browser

### 4. Scanner Not Detecting QR Codes
**Issues**:
- QR code too small or too far away
- Poor lighting conditions
- QR code is damaged or unclear

**Solutions**:
- Hold the camera steady
- Ensure good lighting
- Try different angles
- Make sure the QR code is clear and undamaged

### 5. Browser Compatibility
**Supported Browsers**:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari (iOS 11+)
- ✅ Edge
- ❌ Internet Explorer

### 6. Mobile Device Issues
**Common Problems**:
- Camera not switching to back camera
- Scanner not working in landscape mode

**Solutions**:
- The scanner is configured to use the back camera by default
- Try rotating your device
- Make sure you're not in a restricted app mode

## Testing the Scanner

### Test Page
Visit `/test-scanner` to test the scanner functionality:
- Checks camera support
- Verifies HTTPS requirement
- Tests actual QR code scanning
- Shows detailed error messages

### Sample QR Codes
You can test with these sample batch IDs:
- `BATCH-001`
- `BATCH-002` 
- `BATCH-003`

## Debugging Steps

1. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Look for error messages in the Console tab
   - Check for camera permission errors

2. **Test Camera Access**:
   - Visit a site like `https://webcamtests.com/`
   - Verify your camera works in other applications

3. **Check Network**:
   - Make sure you're on HTTPS or localhost
   - Verify no firewall is blocking camera access

4. **Try Different Devices**:
   - Test on mobile vs desktop
   - Try different browsers
   - Test on different operating systems

## Environment Requirements

### Development
- `http://localhost:3000` ✅
- Modern browser with camera support ✅
- Camera permissions allowed ✅

### Production
- HTTPS enabled ✅
- Modern browser with camera support ✅
- Camera permissions allowed ✅

## Still Having Issues?

If the scanner still doesn't work:

1. **Check the test page**: Visit `/test-scanner` for detailed diagnostics
2. **Browser console**: Look for specific error messages
3. **Try manual input**: Use the manual batch ID input as a fallback
4. **Different device**: Test on a different device/browser

The scanner should work on most modern devices with proper camera permissions and HTTPS/localhost access.
