# REX-Viewer

Web-based viewer for [RexPaint](rexpaint.blogspot.com) files.

## Usage

Load the site in a web browser, drag a font onto the tileset target, and drag an `.xp` file onto the image target.

## Command-line usage

Install [Node.js](http://nodejs.org/) and [Cairo Graphics](http://cairographics.org/). Then run `npm install`.

To convert a .px to a .png:

    ./px2png font16x16.png input.px > output.png
