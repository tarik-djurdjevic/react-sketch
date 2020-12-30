/*eslint no-unused-vars: 0*/

import FabricCanvasTool from './fabrictool'

const fabric = require('fabric').fabric;

class DefaultTool extends FabricCanvasTool {
  configureCanvas(props) {
    let canvas = this._canvas;
    canvas.isDrawingMode = canvas.selection = false;
    canvas.forEachObject((o) => o.selectable = o.evented = false);
    //Change the cursor to the move grabber
    canvas.defaultCursor = 'pointer';
  }

  doMouseDown(o) {
    this.isDown = true;
  }

  doMouseMove(o) {
    if (!this.isDown) return;
  }

  doMouseUp(o) {
    this.isDown = false;
  }
}

export default DefaultTool;