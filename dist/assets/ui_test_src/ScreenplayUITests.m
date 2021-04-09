#import <XCTest/XCTest.h>

// based on iOS Snapshot Testing: https://medium.com/xcnotes/snapshot-testing-in-xcuitest-d18ca9bdeae
static UIImage *cropOutStatusBar(UIImage *img) {
    CGImageRef imageRef = img.CGImage;
    CGFloat yOffset = 22 * img.scale;
    CGRect rect = CGRectMake(
        0,
        yOffset,
        CGImageGetWidth(imageRef),
        CGImageGetHeight(imageRef) - yOffset
    );
    CGImageRef newImageRef = CGImageCreateWithImageInRect(imageRef, rect);
    return [[UIImage alloc] initWithCGImage:newImageRef scale:img.scale orientation:img.imageOrientation];
}

static bool imageIsNotAllWhite(UIImage *img) {
    CGImageRef imageRef = img.CGImage;
    NSData *data = (NSData *) CFBridgingRelease(CGDataProviderCopyData(CGImageGetDataProvider(imageRef)));
    unsigned char *pixels = (unsigned char *)[data bytes];

    for (int i = 0; i < [data length]; i += 4) {
        if ((pixels[i] != 255) || (pixels[i+1] != 255) || (pixels[i+2] != 255)) {
            return YES;
        }
    }

    return NO;
}

@interface ScreenplayUITests : XCTestCase

@end

@implementation ScreenplayUITests

- (void)setUp {
    self.continueAfterFailure = NO;
}

- (void)testScreenshotIsNotEmpty {
    XCUIApplication *app = [[XCUIApplication alloc] init];
    [app launch];

    UIImage *screenshot = app.windows.firstMatch.screenshot.image;
    XCTAssert(imageIsNotAllWhite(cropOutStatusBar(screenshot)));
}

- (void)testScreenContainsElements {
    XCUIApplication *app = [[XCUIApplication alloc] init];
    [app launch];

    XCUIElementQuery *children = [app.windows.firstMatch descendantsMatchingType:XCUIElementTypeAny];
    XCTAssertGreaterThan(children.count, 3); // iOS creates a few default descendants for us
}

#ifdef Screenplay_Test_Purple

- (void)testPurple {
    XCUIApplication *app = [[XCUIApplication alloc] init];
    [app launch];
    [app.buttons[@"Get started"] tap];
    sleep(1);
    XCTAssert(app.buttons[@" "].exists);
}

#endif

@end
