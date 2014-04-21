REM DOS Btach script

REM Minify using Google Closure Compiler
REM https://developers.google.com/closure/compiler/

java -jar compiler.jar ^
	--js=../source/Gamalto.js ^
	--js=../source/Compat.js ^
	--js=../source/GObject.js ^
	--js=../source/Extensions.js ^
	--js=../source/Missing.js ^
^
	--js=../source/GSectionList.js ^
	--js=../source/GSpriteSheet.js ^
	--js=../source/GAnimation.js ^
	--js=../source/GTileSet.js ^
	--js=../source/GFont.js ^
	--js=../source/GTiming.js ^
	--js=../source/GTimer.js ^
	--js=../source/GVector.js ^
	--js=../source/GRect.js ^
	--js=../source/GSize.js ^
	--js=../source/GSurface.js ^
	--js=../source/GRenderer.js ^
	--js=../source/GScreen.js ^
	--js=../source/GBitmap.js ^
	--js=../source/GBaseLibrary.js ^
	--js=../source/GBitmapLibrary.js ^
	--js=../source/GXMLLibrary.js ^
	--js=../source/GDataLibrary.js ^
	--js=../source/GSequence.js ^
	--js=../source/GState.js ^
	--js=../source/GColor.js ^
	--js=../source/GPattern.js ^
	--js=../source/GEvent.js ^
	--js=../source/GEventManager.js ^
	--js=../source/GKeyboardEvent.js ^
	--js=../source/GEventManager_Keyboard.js ^
^
	--js_output_file=gamalto.min.js REM ^
REM	--summary_detail_level=3 ^
REM	--warning_level=VERBOSE
