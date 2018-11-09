/*eslint no-unused-vars: 0*/
/*eslint no-console: 0*/

'use strict';

import React from 'react';
import {CompactPicker} from 'react-color';
import 'flexboxgrid';
import './main.css';
import AppBar from '@material-ui/core/AppBar';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/lab/Slider';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';

import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import ClearIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import RemoveIcon from '@material-ui/icons/Clear';
import DownloadIcon from '@material-ui/icons/CloudDownload';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import ZoomOutIcon from '@material-ui/icons/ZoomOut';
import dataJson from './data.json';
import dataJsonControlled from './data.json.controlled';
import {SketchField, Tools} from '../src';
import dataUrl from './data.url';
import DropZone from 'react-dropzone';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Typography from '@material-ui/core/Typography/Typography';

const styles = {
  root: {
    padding: '3px',
    display: 'flex',
    flexWrap: 'wrap',
    margin: '10px 10px 5px 10px',
    justifyContent: 'space-around',
  },
  gridList: {
    width: '100%',
    overflowY: 'auto',
    marginBottom: '24px',
  },
  gridTile: {
    backgroundColor: '#fcfcfc',
  },
  appBar: {
    backgroundColor: '#333',
  },
  radioButton: {
    marginTop: '3px',
    marginBottom: '3px',
  },
  separator: {
    height: '42px',
    backgroundColor: 'white',
  },
  iconButton: {
    fill: 'white',
    width: '42px',
    height: '42px',
  },
  dropArea: {
    width: '100%',
    height: '64px',
    border: '2px dashed rgb(102, 102, 102)',
    borderStyle: 'dashed',
    borderRadius: '5px',
    textAlign: 'center',
    paddingTop: '20px',
  },
  activeStyle: {
    borderStyle: 'solid',
    backgroundColor: '#eee',
  },
  rejectStyle: {
    borderStyle: 'solid',
    backgroundColor: '#ffdddd',
  },
};

/**
 * Helper function to manually fire an event
 *
 * @param el the element
 * @param etype the event type
 */
function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

class SketchFieldDemo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lineColor: 'black',
      lineWidth: 10,
      fillColor: '#68CCCA',
      backgroundColor: 'transparent',
      shadowWidth: 0,
      shadowOffset: 0,
      tool: Tools.Pencil,
      fillWithColor: false,
      fillWithBackgroundColor: false,
      drawings: [],
      canUndo: false,
      canRedo: false,
      controlledSize: false,
      sketchWidth: 600,
      sketchHeight: 600,
      stretched: true,
      stretchedX: false,
      stretchedY: false,
      originX: 'left',
      originY: 'top',
      imageUrl: 'https://files.gamebanana.com/img/ico/sprays/4ea2f4dad8d6f.png'
    };
  }

  _selectTool = event => this.setState({tool: event.target.value});

  _save = () => {
    let drawings = this.state.drawings;
    drawings.push(this._sketch.toDataURL());
    this.setState({ drawings: drawings });
  };

  _download = () => {
    console.save(this._sketch.toDataURL(), 'toDataURL.txt');
    console.save(JSON.stringify(this._sketch.toJSON()), 'toDataJSON.txt');

    /*eslint-enable no-console*/

    let { imgDown } = this.refs;
    let event = new Event('click', {});

    imgDown.href = this._sketch.toDataURL();
    imgDown.download = 'toPNG.png';
    imgDown.dispatchEvent(event);
  };

  _renderTile = (drawing, index) => {
    return (
      <GridListTile
        key={index}
        title="Canvas Image"
        actionPosition="left"
        titlePosition="top"
        titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
        cols={1}
        rows={1}
        style={styles.gridTile}
        actionIcon={
          <IconButton onTouchTap={c => this._removeMe(index)}>
            <RemoveIcon color="white"/>
          </IconButton>
        }>
        <img src={drawing}/>
      </GridListTile>
    );
  };

  _removeMe = index => {
    let drawings = this.state.drawings;
    drawings.splice(index, 1);
    this.setState({ drawings: drawings });
  };

  _undo = () => {
    this._sketch.undo();
    this.setState({
      canUndo: this._sketch.canUndo(),
      canRedo: this._sketch.canRedo(),
    });
  };

  _redo = () => {
    this._sketch.redo();
    this.setState({
      canUndo: this._sketch.canUndo(),
      canRedo: this._sketch.canRedo(),
    });
  };

  _clear = () => {
    this._sketch.clear();
    this._sketch.setBackgroundFromDataUrl('');
    this.setState({
      controlledValue: null,
      backgroundColor: 'transparent',
      fillWithBackgroundColor: false,
      canUndo: this._sketch.canUndo(),
      canRedo: this._sketch.canRedo(),
    });
  };

  _onSketchChange = () => {
    let prev = this.state.canUndo;
    let now = this._sketch.canUndo();
    if (prev !== now) {
      this.setState({ canUndo: now });
    }
  };

  _onBackgroundImageDrop = (accepted /*, rejected*/) => {
    if (accepted && accepted.length > 0) {
      let sketch = this._sketch;
      let reader = new FileReader();
      let { stretched, stretchedX, stretchedY, originX, originY } = this.state;
      reader.addEventListener(
        'load',
        () =>
          sketch.setBackgroundFromDataUrl(reader.result, {
            stretched: stretched,
            stretchedX: stretchedX,
            stretchedY: stretchedY,
            originX: originX,
            originY: originY,
          }),
        false,
      );
      reader.readAsDataURL(accepted[0]);
    }
  };

  componentDidMount = () => {
    (function(console) {
      console.save = function(data, filename) {
        if (!data) {
          console.error('Console.save: No data');
          return;
        }
        if (!filename) filename = 'console.json';
        if (typeof data === 'object') {
          data = JSON.stringify(data, undefined, 4);
        }
        var blob = new Blob([data], { type: 'text/json' }),
          e = document.createEvent('MouseEvents'),
          a = document.createElement('a');
        a.download = filename;
        a.href = window.URL.createObjectURL(blob);
        a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
        e.initMouseEvent(
          'click',
          true,
          false,
          window,
          0,
          0,
          0,
          0,
          0,
          false,
          false,
          false,
          false,
          0,
          null,
        );
        a.dispatchEvent(e);
      };
    })(console);
  };

  render = () => {
    let { controlledValue } = this.state;
    const theme = createMuiTheme({
      palette: {
        primary: { main: purple[500] }, // Purple and green play nicely together.
        secondary: { main: '#11cb5f' }, // This is just green.A700 as hex.
      },
    });
    return (
      <MuiThemeProvider theme={theme}>
        <div>
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12">
              {/* Application Bar with tools */}

              <AppBar title="Sketch Tool" style={styles.appBar}>
                <Toolbar>
                  <Typography color="inherit">Sketch Tool</Typography>
                  <IconButton
                    disabled={!this.state.canUndo}
                    onClick={this._undo}
                  >
                    <UndoIcon/>
                  </IconButton>
                  <IconButton
                    disabled={!this.state.canRedo}
                    onClick={this._redo}
                  >
                    <RedoIcon/>
                  </IconButton>
                  <IconButton onClick={this._save}>
                    <SaveIcon/>
                  </IconButton>
                  <IconButton onClick={this._download}>
                    <DownloadIcon/>
                  </IconButton>
                  <IconButton onClick={this._clear}>
                    <ClearIcon/>
                  </IconButton>
                </Toolbar>
              </AppBar>
            </div>
          </div>

          {/*Sketch Area with tools*/}

          <div className="row">
            <div className="col-xs-7 col-sm-7 col-md-9 col-lg-9">
              {/* Sketch area */}

              <div style={{ paddingTop: 80 }}/>

              <SketchField
                name="sketch"
                className="canvas-area"
                ref={c => (this._sketch = c)}
                lineColor={this.state.lineColor}
                lineWidth={this.state.lineWidth}
                fillColor={
                  this.state.fillWithColor
                    ? this.state.fillColor
                    : 'transparent'
                }
                backgroundColor={
                  this.state.fillWithBackgroundColor
                    ? this.state.backgroundColor
                    : 'transparent'
                }
                width={
                  this.state.controlledSize ? this.state.sketchWidth : null
                }
                height={
                  this.state.controlledSize ? this.state.sketchHeight : null
                }
                defaultValue={dataJson}
                value={controlledValue}
                forceValue
                onChange={this._onSketchChange}
                tool={this.state.tool}
              />
              <div className="col-xs-5 col-sm-5 col-md-3 col-lg-3">
                <Card style={{ margin: '10px 10px 5px 0' }}>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Tools
                    </Typography>
                    <label htmlFor="tool">Canvas Tool</label>
                    <TextField
                      ref="tool"
                      select
                      value={this.state.tool}
                      onChange={this._selectTool}>
                      <MenuItem value={Tools.Select} key="Select">
                        Select
                      </MenuItem>
                      <MenuItem value={Tools.Pencil} key="Pencil">
                        Pencil
                      </MenuItem>
                      <MenuItem value={Tools.Line} key="Line">
                        Line
                      </MenuItem>
                      <MenuItem value={Tools.Rectangle} key="Rectangle">
                        Rectangle
                      </MenuItem>
                      <MenuItem value={Tools.Circle} key="Circle">
                        Circle
                      </MenuItem>
                      <MenuItem value={Tools.Pan} key="Pan">
                        Pan
                      </MenuItem>
                    </TextField>
                    <br/>
                    <br/>
                    <label htmlFor="slider">Line Weight</label>
                    <Slider
                      ref="slider"
                      step={1}
                      min={0}
                      max={10}
                      aria-labelledby="slider"
                      value={this.state.lineWidth}
                      onChange={(e, v) =>
                        this.setState({ lineWidth: v })
                      }
                    />
                    <br/>
                    <label htmlFor="zoom">Zoom</label>
                    <div>
                      <IconButton
                        ref='zoom'
                        onClick={(e) => this._sketch.zoom(1.25)}>
                        <ZoomInIcon/>
                      </IconButton>
                      <IconButton
                        ref='zoom1'
                        onClick={(e) => this._sketch.zoom(0.8)}>
                        <ZoomOutIcon/>
                      </IconButton>
                      <br/>
                      <br/>
                      <FormControlLabel
                        control={
                          <Switch
                            value={this.state.controlledSize}
                            onChange={(e) => this.setState({ controlledSize: !this.state.controlledSize })}
                          />
                        }
                        label="Control size"
                      />

                      <br/>
                      <label htmlFor='xSize'>Change Canvas Width</label>
                      <Slider
                        ref='xSize' step={1}
                        min={10} max={1000}
                        defaultValue={this.state.sketchWidth}
                        onChange={(e, v) => this.setState({ sketchWidth: v })}/>
                      <br/>
                      <label htmlFor='ySize'>Change Canvas Height</label>
                      <Slider
                        ref='ySize' step={1}
                        min={10} max={1000}
                        defaultValue={this.state.sketchHeight}
                        onChange={(e, v) => this.setState({ sketchHeight: v })}/>
                      <br/>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ margin: '5px 10px 5px 0' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Colors
                  </Typography>
                  <CardContent>
                    <label htmlFor='lineColor'>Line</label>
                    <CompactPicker
                      id='lineColor' color={this.state.lineColor}
                      onChange={(color) => this.setState({ lineColor: color.hex })}/>
                    <br/>
                    <br/>
                    <FormControlLabel
                      control={
                        <Switch
                          value={this.state.fillWithColor}
                          onChange={(e) => this.setState({ fillWithColor: !this.state.fillWithColor })}/>
                      }
                      label="Fill"
                    />

                    <CompactPicker
                      color={this.state.fillColor}
                      onChange={(color) => this.setState({ fillColor: color.hex })}/>
                  </CardContent>
                </Card>

                <Card style={{ margin: '5px 10px 5px 0' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Background
                  </Typography>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          value={this.state.fillWithBackgroundColor}
                          onChange={(e) => this.setState({ fillWithBackgroundColor: !this.state.fillWithBackgroundColor })}/>
                      }
                      label="Background Color"
                    />

                    <CompactPicker
                      color={this.state.backgroundColor}
                      onChange={(color) => this.setState({ backgroundColor: color.hex })}/>

                    <br/>
                    <br/>
                    <label htmlFor='lineColor'>Set Image Background</label>
                    <br/>

                    <FormControlLabel
                      control={
                        <Switch
                          value={this.state.stretched}
                          onChange={(e) => this.setState({ stretched: !this.state.stretched })}/>
                      }
                      label="Fit canvas (X,Y)"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          value={this.state.stretchedX}
                          onChange={(e) => this.setState({ stretchedX: !this.state.stretchedX })}/>
                      }
                      label="Fit canvas (X)"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          value={this.state.stretchedY}
                          onChange={(e) => this.setState({ stretchedY: !this.state.stretchedY })}/>
                      }
                      label="Fit canvas (Y)"
                    />

                    <div>
                      <DropZone
                        ref="dropzone"
                        accept='image/*'
                        multiple={false}
                        style={styles.dropArea}
                        activeStyle={styles.activeStyle}
                        rejectStyle={styles.rejectStyle}
                        onDrop={this._onBackgroundImageDrop}>
                        Try dropping an image here,<br/>
                        or click<br/>
                        to select image as background.
                      </DropZone>
                    </div>
                  </CardContent>
                </Card>

                <Card style={{ margin: '5px 10px 5px 0' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Images
                  </Typography>
                  <CardContent>
                    <div>
                      <TextField
                        floatingLabelText='Image URL'
                        hintText='Copy/Paste an image URL'
                        onChange={(e) => this.setState({ imageUrl: e.target.value })}
                        value={this.state.imageUrl}/>
                      <br/>

                      <Button
                        variant="outlined"
                        onClick={(e) => {
                          this._sketch.addImg(this.state.imageUrl)
                        }
                        }>
                        Load Image from URL
                      </Button>
                    </div>

                    <br/>

                    <br/>

                    <div>
                      <Button
                        variant="outlined"
                        onClick={(e) => this._sketch.addImg(dataUrl)}>
                        Load Image from Data URL
                      </Button>
                    </div>

                  </CardContent>
                </Card>

                <Card style={{ margin: '5px 10px 5px 0' }}>
                  <Typography color="textSecondary" gutterBottom>
                    Controlled value
                  </Typography>
                  <CardContent>
                    <div>
                      <Button
                        variant="outlined"
                        onClick={(e) => this.setState({
                          controlledValue: dataJsonControlled
                        })}>
                        Load controlled Value
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </MuiThemeProvider>
    );
  };
}

export default SketchFieldDemo;
