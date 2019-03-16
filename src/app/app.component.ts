import { Component, HostListener, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import * as firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import { MatDialog } from '@angular/material';
import { LocationStrategy, PathLocationStrategy } from '../../node_modules/@angular/common';

@Component({
  templateUrl: './login.component.html'
})

export class LoginDialogComponent {
}
@Component({
  templateUrl: './delete.component.html'
})
export class DeleteDialogComponent {
  constructor() {
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})

export class AppComponent {
  aggrObjArea = 0;
  backgroundShapeArr = ['Rectangle', 'Triangle', 'Circle', 'Line'];
  canvas;
  canvasSize = 700;
  canvasTwo;
  canvasSizeTwo = 700;
  colorArr = [];
  ctx;
  ctxTwo;
  currImageIndex = 0;
  customImages =
    [{ 'name': 'uploadCustom1', 'crossOrigin': "Anonymous", 'src': 'assets/arabesque_pattern.jpg', 'ready': true, 'fileTooBig': false },
    { 'name': 'uploadCustom2', 'crossOrigin': "Anonymous", 'src': 'assets/kosovo_map.jpg', 'ready': true, 'fileTooBig': false },
    { 'name': 'uploadCustom3', 'crossOrigin': "Anonymous", 'src': 'assets/frieze.jpg', 'ready': true, 'fileTooBig': false },
    { 'name': 'uploadCustom4', 'crossOrigin': "Anonymous", 'src': 'assets/mexico_flag.jpg', 'ready': true, 'fileTooBig': false },
    { 'name': 'uploadCustom5', 'crossOrigin': "Anonymous", 'src': 'assets/van.jpg', 'ready': true, 'fileTooBig': false },
    { 'name': 'uploadCustom6', 'crossOrigin': "Anonymous", 'src': 'assets/trunks.png', 'ready': true, 'fileTooBig': false }
    ];

  database;
  dialogRef;
  displayName = '';
  email = 'kdavnlaan@gmail.com'
  favoritesArr;
  isSafari = false;
  patternFill = false;
  layerCounter = 0;
  login = false;
  maxArea = (700 * 700);
  objNum = 23;
  patternSwitch;
  randomScheme;
  randomShape;
  randomColor;
  randomStrokeOpacity;
  randomShapeOpacity;
  ready = false;
  renderDone = true;
  shapeArr = ['Rectangle', 'Triangle', 'Circle', 'Line'];
  noCircleShapeArr = ['Rectangle', 'Triangle', 'Line'];
  showFavorites = false;
  savedImageArr = [];
  smallShapeArr = ['Rectangle', 'Circle'];
  user;
  ui;
  patternOffset;
  pattern;
  patternArabesque;
  patternTrunks;
  patternFrieze;
  patternBuddhist;
  patternFriezeTwo;
  patternBedroom;
  patternKosovo;
  patternMexico;
  genTypeArr = ["noPattern", "transPattern", "random"];
  isTrunks;
  isFrieze;
  isBuddhist;
  isFriezeTwo;
  genType;
  isArabesque;
  isBedroom = false;
  isMexico;
  singleLayer;
  guid;
  showSignOut = false;
  // removed undo remove features
  undoList = [];
  redoList = [];
  disableRedo = true;
  disableUndo = true;
  edit = false;
  customImagesReady = false;


  @ViewChild('mainContainer') mainContainer;
  @ViewChild('loaderCanvas') loader;
  location;
  constructor(public dialog: MatDialog, location: Location) {
    this.location = location;
  }

  @HostListener('window:keydown', ['$event'])
  handlekeydown(e) {
    const currIndex = this.currImageIndex;

    if (e.keyCode === 39) {
      if ((currIndex + 1) < this.savedImageArr.length) {
        this.currImageIndex++;
        this.renderImage(this.currImageIndex);
      }
    }
    if (e.keyCode === 40) {
      if (currIndex + 5 < this.savedImageArr.length) {
        this.currImageIndex = currIndex + 5;
        this.renderImage(this.currImageIndex);
      }
    }
    if (e.keyCode === 38) {
      if (currIndex - 5 >= 0) {
        this.currImageIndex = currIndex - 5;
        this.renderImage(this.currImageIndex);
      }
    }
    if (e.keyCode === 37) {
      if (currIndex - 1 >= 0) {
        this.currImageIndex--;
        this.renderImage(this.currImageIndex);
      }
    }
  }
  calculateCanvasSize() {
    this.canvas = <HTMLCanvasElement>document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.canvasSize = this.canvas.clientHeight;
    this.ctx.canvas.width = this.canvasSize;
    console.log('canvasSize', this.canvasSize);
    this.ctx.canvas.height = this.canvasSize;

    this.canvasTwo = <HTMLCanvasElement>document.getElementById("myCanvasTwo");
    this.ctxTwo = this.canvasTwo.getContext("2d");
    this.canvasSizeTwo = this.canvasTwo.clientHeight;
    this.ctxTwo.canvas.width = this.canvasSizeTwo;
    console.log('canvasSizeTwo', this.canvasSizeTwo);
    this.ctxTwo.canvas.height = this.canvasSizeTwo;
  }

  openLoginDialog() {
    this.dialogRef = this.dialog.open(LoginDialogComponent, {
      width: '300px'
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('result', result);
    });
  }

  openDeleteDialog(imgObj, index) {
    if (!document.getElementById('delete')) {

      this.dialogRef = this.dialog.open(DeleteDialogComponent, {
        width: '300px'
      });
      this.dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.delete(imgObj, index);
        }
      });
    }
  }

  signOut() {
    // this.ready = false;
    firebase.auth().signOut().then(function () {
      console.log('signout about to do ready = false');
      // this.ready = false;
    }).catch(function (error) {
    });
    if (window.history.length > 1 && this.guid) {
      location.href = '#loggedOut/' + this.guid;
    } 
  }

  async handleSignedInUser() {
    this.displayName = this.user.displayName;
    this.email = this.user.email;

    this.login = true;

    this.email = this.user.email;
    if (location.hash.split('/') && location.hash.split('/')[1] && location.hash.split('/')[2]) {
      this.guid = location.hash.split('/')[2];
    }

    let trimmedName = this.email;
    location.href = '#user/' + this.email + '/' + this.guid;

    if (this.newUser) {
      if (this.savedImageArr.length) {
        for (let img of this.savedImageArr)
          this.saveImageFirebase(img);
      }
    } else {
      this.savedImageArr = [];
      if ((!this.newUser) || (this.newUser && this.savedImageArr.length === 0)) {

        var storageRef = firebase.storage().ref();
        for (let img in this.customImages) {
          let numerator = (parseInt(img) + 1);
           await storageRef.child(trimmedName + '/customImages/uploadCustom' + numerator).getDownloadURL().then((url) => {
            if (url) {
              this.customImages[parseInt(img)].src = url;
            }
          }).catch(function (error) {
          });
          if (parseInt(img) == (this.customImages.length - 1)) {
            this.setCustomImages();
          }
        }
        await this.database.collection('users/' + trimmedName + '/images').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            this.savedImageArr.push(doc.data());
          });
          if (querySnapshot.docs.length) {
            this.renderImage(0);
          } else {
            if (this.savedImageArr.length === 0) {
              this.getRandomArt(true);
            }
          }
        });
      }
    }
  }

  toggleSignOut() {
    this.showSignOut = !this.showSignOut;

  }
  async openLoginModal() {
    this.openLoginDialog();

    await this.ui.start('#firebaseui-container', this.getUiConfig());
  }

  async handleSignedOutUser() {
    let guid = '';
    if (location.hash.split('/') && location.hash.split('/')[1]) {
      this.guid = location.hash.split('/')[1];
      guid = this.guid;
      guid = location.hash.split('/')[1];
    }

    if (!document.getElementById('firebaseui-container')) {
      this.login = false;

      if (!this.user) {
        // create a rand guid
        if (location.href.indexOf('loggedOut') < 0) {
          this.guid = this.getGuid();
          location.href = '#loggedOut/' + this.guid;
          this.getRandomArt(true);
        } else {
          if (guid) {
            var storageRef = firebase.storage().ref();
            for (let img in this.customImages) {
              let numerator = (parseInt(img) + 1);
               await storageRef.child(guid + '/customImages/uploadCustom' + numerator).getDownloadURL().then((url) => {
                if (url) {
                  this.customImages[parseInt(img)].src = url;
                }
              }).catch(function (error) {
              });
              if (parseInt(img) == (this.customImages.length - 1)) {
                this.setCustomImages();
              }
            }
            this.savedImageArr = [];
            await this.database.collection('users/' + guid + '/images').get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                console.log('this second', this);
                this.savedImageArr.push(doc.data());
              });
              if (querySnapshot.docs.length) {
                this.renderImage(0);
              } else {
                this.getRandomArt(true);
              }
            });

          }
        }
        await this.openLoginModal();
      }
    }
  }

  newUser = false;
  suffix = '';
  getUiConfig() {
    var uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function (this, authResult, redirectUrl) {
          this.login = true;
          console.log('authResult', authResult);
          this.suffix = '/' + this.guid;
          this.displayName = authResult.additionalUserInfo.profile.name.replace(/\s/g, '');

          if (authResult.additionalUserInfo.isNewUser) {
            this.newUser = true;
          } else {
            this.newUser = false;
            //           this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            // this.ctx.fillStyle = 'white';
            // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
          }
          if (authResult.user) {
            this.user = authResult.user;
            // this.handleSignedInUser(authResult.user);
          }
          // if (authResult.additionalUserInfo) {
          // document.getElementById('is-new-user').textContent =
          // authResult.additionalUserInfo.isNewUser ?
          // 'New User' : 'Existing User';
          // }
          // Do not redirect.
          this.dialogRef.close(LoginDialogComponent);
          return false;
        }.bind(this),
        uiShown: function () {
          // The widget is rendered.
          // Hide the loader.
          // document.getElementById('firebaseui-auth-container').style.display = 'none';

          document.getElementById('loader').style.display = 'none';
        }
      },
      signInSuccessUrl: '' + location.host + '/#user/' + this.displayName + this.suffix,
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
      ]
    };
    return uiConfig;
  }

  uploadCustomImage(fileName, event) {
    fileName = 'uploadCustom' + (fileName + 1);

    const replaceObj = this.customImages.find(img => { return img.name === fileName })
    const replaceIndex = this.customImages.indexOf(replaceObj);

    if (event.target.files && event.target.files[0]) {
      this.customImages[replaceIndex].ready = false;
      let file = event.target.files[0]
      const url = window.URL.createObjectURL(file);
      const newImg = new Image();
      newImg.crossOrigin = "Anonymous";
      newImg.src = url;

      const fileUrl = newImg.src;
      let trimmedName = this.guid;
      if (this.user) {
        this.email = this.user.email;
        trimmedName = this.email;
      }

// console.log('file.size', file.size);
      var fileSize = file.size / 1024 / 1024; // in MB
      if (fileSize > 1) {
  
      // if (this.byteCount(fileUrl) > 1048487) {
        this.customImages[replaceIndex].ready = true;
        this.customImages[replaceIndex].fileTooBig = true;
      
        alert('File size exceeds 1 MB');
        setTimeout(() => {
          this.customImages[replaceIndex].fileTooBig = false;
        }, 1000);
        return;

      } else {
        var storageRef = firebase.storage().ref();
        storageRef.child(trimmedName + '/customImages/' + fileName).put(file).then(function (snapshot) {
          console.log('Uploaded a blob or file!', snapshot);
        });
      }

      if (replaceIndex >= 0) {
        this.customImages[replaceIndex].src = fileUrl;
      } else {
        this.customImages.push({ 'name': fileName, 'crossOrigin': "Anonymous", 'src': fileUrl, 'ready': true, 'fileTooBig': false });
      }
      this.setCustomImages();
    }
  }
  setCustomImages() {
    // this.ready = false;
    for (let img of this.customImages) {
      let fileName = img.name;
      let fileUrl = img.src;
      if (fileName === 'uploadCustom1') {

        this.patternArabesque.src = fileUrl;
        this.patternArabesque.crossOrigin = "Anonymous";
        this.patternArabesque.onload = function () {
          const pattern = this.ctx.createPattern(this.patternArabesque, 'repeat');
          this.ctx.fillStyle = pattern;
          this.customImages[0].ready = true;
        }.bind(this);
      }
      if (fileName === 'uploadCustom2') {
        this.patternKosovo.src = fileUrl;
        this.patternKosovo.onload = function () {
          const pattern = this.ctx.createPattern(this.patternKosovo, 'repeat');
          this.ctx.fillStyle = pattern;
          this.customImages[1].ready = true;

        }.bind(this);
      }
      if (fileName === 'uploadCustom3') {
        this.patternFrieze.src = fileUrl;
        this.patternFrieze.onload = function () {
          const pattern = this.ctx.createPattern(this.patternFrieze, 'repeat');
          this.ctx.fillStyle = pattern;
          this.customImages[2].ready = true;
        }.bind(this);
      }

      if (fileName === 'uploadCustom4') {
        this.patternMexico.src = fileUrl;
        this.patternMexico.onload = function () {
          const pattern = this.ctx.createPattern(this.patternMexico, 'repeat');
          this.ctx.fillStyle = pattern;
          this.customImages[3].ready = true;
        }.bind(this);
      }

      if (fileName === 'uploadCustom5') {
        this.patternFriezeTwo.src = fileUrl;
        this.patternFriezeTwo.onload = function () {
          const pattern = this.ctx.createPattern(this.patternFriezeTwo, 'repeat');
          this.ctx.fillStyle = pattern;
          this.customImages[4].ready = true;
        }.bind(this);
      }
      if (fileName === 'uploadCustom6') {
        this.patternTrunks.src = fileUrl;
        this.patternTrunks.onload = function () {
          const pattern = this.ctx.createPattern(this.patternTrunks, 'repeat');
          this.ctx.fillStyle = pattern;
          this.customImages[5].ready = true;
        }.bind(this);
      }
    }
    // this.ready = true;
  }
  async ngOnInit() {
    this.ready = false;
    this.renderDone = false;

    // creating the pattern images for image patterns
    this.patternArabesque = new Image();
    this.patternArabesque.crossOrigin = "Anonymous";

    this.patternTrunks = new Image();
    this.patternTrunks.crossOrigin = "Anonymous";

    this.patternKosovo = new Image();
    this.patternKosovo.crossOrigin = "Anonymous";

    this.patternMexico = new Image();
    this.patternMexico.crossOrigin = "Anonymous";

    this.patternBuddhist = new Image();
    this.patternBuddhist.crossOrigin = "Anonymous";

    this.patternBedroom = new Image();
    this.patternBedroom.crossOrigin = "Anonymous";


    this.patternFrieze = new Image();
    this.patternFrieze.crossOrigin = "Anonymous";

    this.patternFriezeTwo = new Image();
    this.patternFriezeTwo.crossOrigin = "Anonymous";

    this.patternBedroom.src = 'assets/haystacks.jpg';
    this.patternFriezeTwo.crossOrigin = "Anonymous";

    this.patternBedroom.onload = function () {
      const pattern = this.ctx.createPattern(this.patternBedroom, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);

    this.patternBuddhist.src = 'assets/buddhist.png';
    this.patternBuddhist.onload = function () {
      const pattern = this.ctx.createPattern(this.patternBuddhist, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);

    this.patternFrieze.src = 'assets/van.jpg';
    this.patternFrieze.onload = function () {
      const pattern = this.ctx.createPattern(this.patternFrieze, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);
    this.patternFriezeTwo.src = 'assets/frieze.jpg';
    this.patternFriezeTwo.onload = function () {
      const pattern = this.ctx.createPattern(this.patternFriezeTwo, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);
    this.patternArabesque.src = 'assets/arabesque_pattern.jpg';
    this.patternArabesque.onload = function () {
      const pattern = this.ctx.createPattern(this.patternArabesque, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);

    this.patternTrunks.src = 'assets/trunks.png';
    this.patternTrunks.onload = function () {
      const pattern = this.ctx.createPattern(this.patternTrunks, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);

    this.patternKosovo.src = 'assets/kosovo_map.jpg';
    this.patternKosovo.onload = function () {
      const pattern = this.ctx.createPattern(this.patternKosovo, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);
    this.patternMexico.src = 'assets/mexico_flag.jpg';
    this.patternMexico.onload = function () {
      const pattern = this.ctx.createPattern(this.patternMexico, 'repeat');
      this.ctx.fillStyle = pattern;
    }.bind(this);

    // this.pattern.src = 'assets/arabesque_pattern.jpg';


    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    // setting up firebase
    var config = {
      apiKey: "AIzaSyD98GbUHORmW3-C9nxvqboQLapTXxnSMM0",
      authDomain: "artgenerator-8008a.firebaseapp.com",
      databaseURL: "https://artgenerator-8008a.firebaseio.com",
      projectId: "artgenerator-8008a",
      storageBucket: "artgenerator-8008a.appspot.com",
      messagingSenderId: "858892303412"
    };
    firebase.initializeApp(config);

    this.database = firebase.firestore();
    const settings = { timestampsInSnapshots: true };
    this.database.settings(settings);
    this.ui = new firebaseui.auth.AuthUI(firebase.auth());
    this.user = firebase.auth().currentUser;

    this.calculateCanvasSize();

    firebase.auth().onAuthStateChanged(async function (this, user) {
      this.user = user;
      this.user ? await this.handleSignedInUser() : await this.handleSignedOutUser();
      // this.ready = true;
    }.bind(this));
  }

  getRandomArt(clear, recurseStep?) {
    // hide favorites because we're about to switch to savedimagearr
    this.showFavorites = false;
    // hiding stuff since a new image is being drawn
    this.renderDone = false;
    this.loader.nativeElement.style.visibility = "visible";
    this.edit = false;
    this.singleLayer = false;
    // if (this.edit) {
    // this.toggleEdit();
    // }

    //these values are related to what the art will look like 
    let recurse = false;
    this.objNum = Math.floor(Math.random() * 23) + 10;
    this.patternFill = this.randomlyChooseTrueOrFalse();

    this.isTrunks = false;
    this.isArabesque = false;
    this.isMexico = false;
    this.isFrieze = false;
    this.isBedroom = false;

    this.isFriezeTwo = false;
    this.isBuddhist = false;
    if (recurseStep === undefined) {

      this.genType = this.genTypeArr[Math.floor(Math.random() * this.genTypeArr.length)];

      this.patternFill = this.randomlyChooseTrueOrFalse();

      // if no recurse, this means this is a new piece, not just a layer, so clear and calculate recurse chance
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      recurse = this.randomlyChooseTrueOrFalse();
    } else {
      // if recurseStep is defined then we know
      recurse = true;
    }

    if (this.genType === 'noPattern' || (this.genType === 'transPattern' && this.singleLayer)) {
      // this.isTrunks = this.randomlyChooseTrueOrFalse();
      this.isTrunks = this.randomlyChooseTrueOrFalseThird();
      if (!this.isTrunks) {
        if (this.randomlyChooseTrueOrFalseThird) {
          this.isArabesque = false;
          this.isFrieze = true;
          this.isFriezeTwo = false;
          this.isMexico = false;
          if (this.randomlyChooseTrueOrFalseThird) {
            this.isFriezeTwo = true;
            this.isFrieze = false;
          }

        } else {
          this.isFrieze = false;
          this.isFriezeTwo = false;
          this.isArabesque = true;
          this.isMexico = false;
          if (this.randomlyChooseTrueOrFalseThird) {
            this.isFriezeTwo = true;
            this.isArabesque = false;
          }
        }
      } else {
        this.isArabesque = false;
        this.isFrieze = false;
        this.isFriezeTwo = false;
        this.isMexico = false;
      }
      this.isArabesque = false;
      this.isFrieze = false;
      this.isFriezeTwo = false;
      this.isMexico = false;
      this.isTrunks = false;
      this.isBuddhist = false;
      const solidSwitch = Math.floor(Math.random() * 7) + 1;
      if (solidSwitch === 1) {
        this.isArabesque = true;
      } else if (solidSwitch === 2) {
        this.isArabesque = true;
      } else if (solidSwitch === 3) {
        this.isTrunks = false;
      } else if (solidSwitch === 4) {
        this.isFrieze = true;
      } else if (solidSwitch === 5) {
        this.isFrieze = true;
      } else if (solidSwitch === 6) {
        this.isFriezeTwo = true;
      }
      //  else if (solidSwitch === 7) {
      //   this.isBedroom = true;   
      // }
      // else if (solidSwitch === 8) {

      //   this.isBuddhist = true;
      // } 

      else {
        this.isMexico = true;
      }
    }

    console.log('metadata: genType', this.genType, 'this.isTrunks:', this.isTrunks, 'this.isArabesque', this.isArabesque);
    // because it's fast - we only care about making the load if it's new AND layers
    if (!recurse && recurseStep === undefined) {
      this.singleLayer = true;
    }
    if (recurse && recurseStep === undefined) {
      // recurseStep = Math.floor(Math.random() * 10) + 4;
      recurseStep = Math.floor(Math.random() * 9) + 4;
      var img = new Image();
      img.src = this.canvas.toDataURL();
      img.onload = function () {
        this.ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize, 0, 0, this.canvasSize, this.canvasSize);
        this.getRandomArtAlg(clear, recurse, recurseStep);
      }.bind(this);
    } else {
      this.getRandomArtAlg(clear, recurse, recurseStep);
    }
  }

  getRandomArtAlg(clear, recurse, recurseStep) {
    // setup
    // this.randomScheme = this.colorSchemes[Math.floor(Math.random() * this.colorSchemes.length)];
    this.randomScheme = "Random";
    this.colorArr = this.getRandomColorArr();
    let rand = 1;
    this.patternOffset = 0;
    const offsetRand = this.randomlyChooseTrueOrFalse();
    if (offsetRand) {
      this.patternOffset = Math.floor(Math.random() * 100) - 100;
    }

    // first layer of small objects;
    this.resetForNewLayer();
    this.getFirstSmallLayer();
    this.resetForNewLayer();

    // layer of transparent objects
    let norm = true;
    rand = Math.floor(Math.random() * 3) + 1;
    if (rand === 2) {
      norm = false;
    }
    // if(recurseStep === undefined) {
    // norm = false;
    // }
    let trapTrans = 2;
    if (rand === 2) {
      trapTrans = this.randomlyChooseOneOrTwo();
    }

    let layerNum = 20;
    if (norm || trapTrans === 1) {
      if (trapTrans === 1) {
        layerNum = 10;
        this.backgroundShapeArr = ['Rectangle', 'Circle', 'Line'];
      } else {
        this.backgroundShapeArr = ['Rectangle', 'Triangle', 'Circle', 'Line'];
      }
      while (this.layerCounter < layerNum) {
        this.randomColor = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
        this.randomStrokeOpacity = Math.random() * 1;
        this.randomShapeOpacity = Math.random() * 1;
        var randomShape = this.backgroundShapeArr[Math.floor(Math.random() * this.shapeArr.length)];
        var stroke = this.getRandomRgb();
        if (this.randomScheme === 'Complementary') {
          var complStroke = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
          this.ctx.strokeStyle = complStroke.substring(0, complStroke.length - 1) + ',' + this.randomStrokeOpacity + ")";
        } else if (this.randomScheme !== 'Monochromatic') {
          this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ')';
        } else {
          this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ')';
        }
        rand = this.randomlyChooseOneOrTwo();
        if (rand === 1) {
          this.ctx.strokeStyle = 'black';
        }

        // if (!this.isSafari) {
        this.randomColor = this.randomColor.substring(0, this.randomColor.length - 1) + ',' + this.randomShapeOpacity + ")";
        // }
        this.ctx.globalAlpha = (Math.random() * .4);
        this.ctx.fillStyle = this.randomColor;
        this.patternFill = this.randomlyChooseTrueOrFalse();
        this.ctx.lineWidth = Math.random() * 10;
        this.drawShape(randomShape);
        this.layerCounter++;
      }
    }
    this.resetForNewLayer();
    // layer of main shapes
    let objNum = this.objNum;
    if (this.genType === 'transPattern') {
      objNum = Math.floor(Math.random() * 23) + 19;
    }
    // if(this.genType === 'noPattern)' && norm) {
    // objNum = Math.floor(Math.random() * 23) + 19;
    // }
    this.getMainLayer(objNum, norm, rand, trapTrans);

    this.resetForNewLayer();
    // let lineWidthArr = [];

    // second small layer
    this.getSecondSmallLayer(norm);
    this.setUndoRedo(clear);
    // this.ctx.globalAlpha = 1;
    if (recurse && recurseStep && recurseStep > 1) {
      recurseStep--;
      this.getRandomArt(clear, recurseStep);
    } else {
      this.saveCurrentArt(clear);
    }
  }
  getSecondSmallLayer(norm) {
    let count = 25;
    if (norm) {
      count = 45;
    }
    while (this.layerCounter <= count) {
      this.randomColor = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
      this.randomStrokeOpacity = Math.random() * 1;
      this.randomShapeOpacity = Math.random() * .5;
      const randomShape = this.smallShapeArr[Math.floor(Math.random() * this.shapeArr.length)];
      const stroke = this.getRandomRgb();

      this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ', 1)';
      const blackStroke = this.randomlyChooseTrueOrFalse();
      if (blackStroke) {
        this.ctx.strokeStyle = 'black';
      }
      this.randomColor = this.randomColor.substring(0, this.randomColor.length - 1) + ',' + this.randomShapeOpacity + ")";

      // draft for dealing with Safari browser
      // if (!this.isSafari) {
      // this.ctx.globalAlpha = 1;
      // this.randomColor = this.randomColor.substring(0, this.randomColor.length - 1) + ',' + this.randomShapeOpacity + ")";
      // const rand = Math.floor(Math.random() * 2) + 1;
      // if (rand === 1) {
      // this.ctx.globalAlpha = this.randomShapeOpacity;
      // }
      // } else {
      // this.ctx.globalAlpha = this.randomShapeOpacity;
      // }
      this.ctx.fillStyle = this.randomColor;
      this.patternFill = this.randomlyChooseTrueOrFalse();
      this.ctx.lineWidth = Math.random() * 10;
      this.drawShape(randomShape, true);
      this.layerCounter++;
    }
  }
  getFirstSmallLayer() {
    while (this.layerCounter <= 25) {
      this.randomColor = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
      this.randomStrokeOpacity = Math.random();
      this.randomShapeOpacity = Math.random();
      var randomShape = this.smallShapeArr[Math.floor(Math.random() * this.shapeArr.length)];
      var stroke = this.getRandomRgb();
      if (this.randomScheme === 'Complementary') {
        var complStroke = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
        this.ctx.strokeStyle = complStroke.substring(0, complStroke.length - 1) + ',' + this.randomStrokeOpacity + ")";
      } else if (this.randomScheme !== 'Monochromatic') {
        this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ', 1)';
      } else {
        this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ', 1)';
      }
      let rand = this.randomlyChooseOneOrTwo();
      if (rand === 1) {
        this.ctx.strokeStyle = 'black';
      }
      if (!this.isSafari) {
        this.ctx.globalAlpha = 1;
        this.randomColor = this.randomColor.substring(0, this.randomColor.length - 1) + ',' + this.randomShapeOpacity + ")";
        rand = Math.floor(Math.random() * 2) + 1;
        if (rand === 1) {
          this.ctx.globalAlpha = this.randomShapeOpacity;
        }
      } else {
        this.ctx.globalAlpha = this.randomShapeOpacity;
      }
      this.ctx.fillStyle = this.randomColor;
      this.patternFill = this.randomlyChooseTrueOrFalse();
      this.ctx.lineWidth = Math.random() * 10;
      this.drawShape(randomShape, true);
      this.layerCounter++;
    }
  }
  resetForNewLayer() {
    this.layerCounter = 0;
    this.ctx.globalAlpha = 1;
    this.aggrObjArea = 0;
    this.shapeArr = ['Rectangle', 'Triangle', 'Circle', 'Line'];
  }

  getMainLayer(objNum, norm, rand, trapTrans) {
    // 'Circle',
    this.shapeArr = ['Rectangle', 'Triangle', 'Line'];

    if (this.genType !== 'random') {
      this.patternFill = false;
    } else {
      this.patternFill = this.randomlyChooseTrueOrFalse();
      if (this.patternFill === false) {
        this.patternFill = this.randomlyChooseTrueOrFalse();
      }
      // if (this.patternFill === false) {
      // this.patternFill = this.randomlyChooseTrueOrFalse();
      // }
    }
    if (this.genType === 'all') {
      this.patternFill = true;
    }
    norm = false;
    if (!norm) {
      objNum = Math.floor(Math.random() * 1) + 5;
      // this.shapeArr = ['Trapezoid', 'Circle'];
      // this.shapeArr = ['Trapezoid'];

      // const rand = this.randomlyChooseOneOrTwo();
      // if (rand === 1) {
      console.log('weird trap layer');
      this.shapeArr = ['Trapezoid', 'Line'];
      if (this.singleLayer) {
        this.isTrunks = this.randomlyChooseTrueOrFalse();
        if (this.isTrunks) {
          this.isArabesque = false;
          this.isFrieze = false;
          this.isFriezeTwo = false;
          this.patternFill = true;
          this.isMexico = this.randomlyChooseTrueOrFalse();
          if (this.isMexico) {
            this.isTrunks = false;
          }
        } else {
          this.patternFill = false;
        }

      }
      // if (this.isTrunks) {
      // this.isTrunks = this.randomlyChooseTrueOrFalse();
      // }
      // if (this.isArabesque) {
      // this.isArabesque = this.randomlyChooseTrueOrFalse();
      // }
      // this.isTrunks = false;

      // this.isArabesque = false;
      // this.patternFill = false;
      // }
    }
    while (this.layerCounter < objNum) {

      this.randomColor = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];

      // randomShapeOpacity = Math.random() * (1) - layerCounter/objNum;
      this.randomShapeOpacity = Math.random();
      if (this.randomShapeOpacity < 0) {
        this.randomShapeOpacity = 0;
      }
      if (this.layerCounter === (objNum - 1) || this.layerCounter === (objNum)) {
        this.randomShapeOpacity = 0;
        this.patternFill = false;
      }
      if (this.layerCounter === (objNum - 2)) {
        this.randomShapeOpacity = .1;
      }
      var randomShape = this.shapeArr[Math.floor(Math.random() * this.shapeArr.length)];
      // var randomAC = Math.random() * 1;
      var stroke = this.getRandomRgb();

      this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ')';


      rand = Math.floor(Math.random() * 2) + 1;
      if (rand === 1) {
        this.ctx.strokeStyle = 'black';
      }

      this.randomColor = this.randomColor.substring(0, this.randomColor.length - 1) + ',' + this.randomShapeOpacity + ")";
      // if (!this.isSafari) {
      // this.randomColor = this.randomColor.substring(0, this.randomColor.length - 1) + ',' + this.randomShapeOpacity + ")";
      // } else {
      // this.ctx.globalAlpha = this.randomShapeOpacity;
      // }
      this.ctx.fillStyle = this.randomColor;
      // default is middle
      let newLineWidth = Math.random() * 5 + 1;
      if (this.layerCounter < (objNum / 4) || (this.layerCounter > (objNum * .5) && this.layerCounter < (objNum * .6))) {
        newLineWidth = Math.random() * 20 + 16;
      }
      // if(this.layerCounter === objNum/2) {
      // ne
      // }
      // if(this.layerCounter > (objNum - objNum/3)) {
      // newLineWidth = Math.random() * 5;
      // }

      // let newLineWidth = Math.random() * 10;
      // lineWidthArr.push(newLineWidth);
      // if (!norm) {
      // if (this.isLineWidthArrMostlyThick(lineWidthArr)) {
      // newLineWidth = Math.random() * 5;
      // }
      // }
      this.ctx.lineWidth = newLineWidth;
      if (!norm) {
        // console.log('trapnTrans', trapTrans);
        // this.ctx.lineWidth = (Math.random() * 10) + 1;
      }
      this.drawShape(randomShape, false, true);
      this.layerCounter++;
    }
  }

  drawShape(shape, small?, main?) {
    // this.patternFill = false;
    var offset_x = 0;
    var offset_y = 0;
    var isOffset = false;
    var isOffset = this.randomlyChooseTrueOrFalse();
    var xPos = Math.random() * this.canvasSize;
    var yPos = Math.random() * this.canvasSize;
    var height = Math.random() * this.canvasSize;
    var width = Math.random() * this.canvasSize;
    let currObjArea = height * width;

    this.patternSwitch = Math.floor(Math.random() * 8) + 1;
    rand = this.randomlyChooseOneOrTwo();
    if (this.genType === "noPattern" && main) {
      this.patternFill = true;
    }
    if (this.patternFill) {
      if (this.patternSwitch === 1) {
        //   if (rand === 1) {
        //     this.ctx.fillStyle = this.ctx.createPattern(this.patternArabesque, 'repeat');
        //   } else if (rand === 2) {
        //     this.ctx.fillStyle = this.ctx.createPattern(this.patternTrunks, 'repeat');
        //     isOffset = true;
        //     offset_x = this.patternOffset;
        //     offset_y = this.patternOffset;
        //   }
        this.ctx.fillStyle = this.ctx.createPattern(this.patternFrieze, 'repeat');
        isOffset = true;

        offset_x = this.patternOffset;
        offset_y = this.patternOffset;
      } else if (this.patternSwitch === 2) {
        if (rand === 1) {
          this.ctx.fillStyle = this.ctx.createPattern(this.patternKosovo, 'repeat');
        } else if (rand === 2) {
          this.ctx.fillStyle = this.ctx.createPattern(this.patternMexico, 'no-repeat');
        }
      } else if (this.patternSwitch === 3) {
        this.ctx.fillStyle = this.ctx.createPattern(this.patternTrunks, 'repeat');
        isOffset = true;

        offset_x = this.patternOffset;
        offset_y = this.patternOffset;

      } else if (this.patternSwitch === 4) {
        if (rand === 1) {

          this.ctx.fillStyle = this.ctx.createPattern(this.patternMexico, 'no-repeat');

        } else if (rand === 2) {
          this.ctx.fillStyle = this.ctx.createPattern(this.patternTrunks, 'repeat');
          isOffset = true;

          offset_x = this.patternOffset;
          offset_y = this.patternOffset;
        }
      } else if (this.patternSwitch === 5) {
        this.ctx.fillStyle = this.ctx.createPattern(this.patternKosovo, 'repeat');
      } else if (this.patternSwitch === 6) {
        this.ctx.fillStyle = this.ctx.createPattern(this.patternArabesque, 'repeat');
      } else if (this.patternSwitch === 7) {
        this.ctx.fillStyle = this.ctx.createPattern(this.patternFriezeTwo, 'repeat');
        isOffset = true;

        offset_x = this.patternOffset;
        offset_y = this.patternOffset;
      } else {
        this.ctx.fillStyle = this.ctx.createPattern(this.patternMexico, 'no-repeat');
      }
      if (this.isFrieze && main) {
        offset_x = this.patternOffset;
        offset_y = this.patternOffset;
        isOffset = true;
        this.ctx.fillStyle = this.ctx.createPattern(this.patternFrieze, 'repeat');
        console.log('created pattern frieze');
      }
      if (this.isFriezeTwo && main) {
        offset_x = this.patternOffset;
        offset_y = this.patternOffset;
        isOffset = true;
        this.ctx.fillStyle = this.ctx.createPattern(this.patternFriezeTwo, 'repeat');
        console.log('created pattern frieze');


      }
      if (this.isTrunks && main) {
        // if(rand === 1) {
        this.ctx.fillStyle = this.ctx.createPattern(this.patternTrunks, 'repeat');

        isOffset = true;

        offset_x = this.patternOffset;
        offset_y = this.patternOffset;
        // } else {
        // this.ctx.fillStyle = this.ctx.createPattern(this.patternArabesque, 'repeat');
        // }
        console.log('created pattern trunks');

      }
      if (this.isArabesque && main) {
        console.log('seetting to this.isarabesque')
        // if(rand === 1) {
        offset_x = this.patternOffset;
        offset_y = this.patternOffset;
        isOffset = false;
        this.ctx.fillStyle = this.ctx.createPattern(this.patternArabesque, 'repeat');
        console.log('created pattern arabesque');
      }


      if (this.isMexico && main) {
        console.log('seetting to this.isarabesque')
        // if(rand === 1) {
        offset_x = 0;
        offset_y = 0;
        isOffset = false;
        this.ctx.fillStyle = this.ctx.createPattern(this.patternMexico, 'no-repeat');
        console.log('created pattern mexico');
      }

      // if (this.isBuddhist && main) {
      //   console.log('seetting to this.isarabesque')
      //   // if(rand === 1) {
      //   offset_x = 0;
      //   offset_y = 0;
      //   isOffset = false;
      //   this.ctx.fillStyle = this.ctx.createPattern(this.patternBuddhist, 'repeat');
      //   console.log('created pattern mexico');
      // }

      if (this.isBedroom && main) {
        console.log('seetting to this.isarabesque')
        // if(rand === 1) {
        offset_x = 0;
        offset_y = 0;
        isOffset = false;
        this.ctx.fillStyle = this.ctx.createPattern(this.patternBedroom, 'repeat');
        console.log('created pattern mexico');
      }

      if (isOffset) {
        this.ctx.translate(offset_x, offset_y);
      }

    }
    rand = Math.floor(Math.random() * 100) + 1;

    // this code draft for if I want to just have small symbols in outer layer
    // if (small && rand === 4) {
    // var img = new Image();
    // img.src = '../assets/wowlogo.png';
    // img.onload = function () {
    // currObjArea = 10;
    // this.ctx.drawImage(img, xPos, yPos);
    // return;
    // }.bind(this);

    // }

    // note see what maxArea should be
    // >= (Math.pow(this.canvasSize, 2)
    if (small || (this.aggrObjArea + currObjArea + 250) >= (Math.pow(this.canvasSize, 2))) {
      height = Math.random() * this.canvasSize / 25;
      width = Math.random() * this.canvasSize / 25;
      currObjArea = height * width;
    }

    // if (shape === 'Circle') {
    // const changeShape = this.randomlyChooseTrueOrFalse();
    // if (changeShape && !small) {
    // shape = this.noCircleShapeArr[Math.floor(Math.random() * this.noCircleShapeArr.length)];
    // }
    // }
    switch (shape) {
      case 'Rectangle':
        this.ctx.fillRect(xPos, yPos, width, height);
        this.ctx.strokeRect(xPos, yPos, width, height);
        break;
      case 'Trapezoid':
        this.ctx.beginPath();
        let rand1 = Math.random() * this.canvasSize;
        const y1 = Math.random() * this.canvasSize;
        //first point
        this.ctx.moveTo(rand1, y1);
        let rand2 = Math.random() * this.canvasSize;

        //second point completes first side
        let y2 = Math.random() * this.canvasSize;
        this.ctx.lineTo(rand2, y2);
        let rand3 = Math.random() * this.canvasSize;

        let y3 = Math.random() * this.canvasSize;

        // third point completes second side
        this.ctx.lineTo(rand3, y3);
        // fourth point -- cannot cross first line
        //logic here such 
        const heightLow = Math.max(y1, y3);
        const heightHigh = Math.min(y1, y3);

        const leftMost = Math.min(rand1, rand3);
        const rightMost = Math.max(rand1, rand3);
        const addToLeftMost = Math.random() * (rightMost - leftMost);
        let rand4 = leftMost + addToLeftMost;
        let y4 = heightLow - (Math.random() * (heightLow - heightHigh));

        if (rand1 === leftMost && y1 === heightHigh && rand4 < rand2) {
          y4 = y1 + Math.random() * this.canvasSize;
        }
        this.ctx.lineTo(rand4, y4);
        this.ctx.fill();
        this.ctx.lineTo(rand1, y1);
        this.ctx.stroke();
        currObjArea = this.calcPolygonArea([{ x: rand1, y: y1 }, { x: rand2, y: rand1 }, { x: rand3, y: rand2 }, { x: rand4, y: y2 }]);

        break;
      case 'Triangle':
        this.ctx.beginPath();
        rand1 = xPos;
        rand2 = yPos;
        const ty1 = Math.random() * this.canvasSize;
        const ty2 = Math.random() * this.canvasSize;
        this.ctx.moveTo(rand1, ty1);
        this.ctx.lineTo(rand2, rand1);
        this.ctx.lineTo(rand2, ty2);
        this.ctx.stroke();
        this.ctx.lineTo(rand1, ty1);
        this.ctx.fill();
        currObjArea = this.calcPolygonArea([{ x: rand1, y: ty1 }, { x: rand2, y: rand1 }, { x: rand2, y: ty2 }]);
        break;

      case 'Line':
        rand1 = Math.random() * this.canvasSize;
        var rand = Math.floor(Math.random() * 2) + 1;
        if (rand === 1) {
          rand2 = rand1 + 15;
        } else {
          rand2 = rand1 - 15;
        }
        let ly1 = Math.random() * this.canvasSize;
        let ly2 = Math.random() * this.canvasSize;

        this.ctx.moveTo(rand1, ly1);
        this.ctx.lineTo(rand2, rand1);
        this.ctx.lineTo(rand2, ly2);
        this.ctx.stroke();
        // pythagorean theorem
        currObjArea = this.ctx.lineWidth * (this.getDistance(rand1, ly1, rand2, rand1) + this.getDistance(rand2, rand1, rand2, ly2));
        break;
      case 'Circle':
        var radius = width / 2;
        this.ctx.beginPath();
        this.ctx.arc(xPos, yPos, radius, 0, 2 * Math.PI, false);
        this.ctx.fill();
        this.ctx.stroke();

        currObjArea = Math.PI * Math.pow(radius, 2);
        // get better with calculating for circles
        break;
    }
    if (this.patternFill) {
      if (isOffset) {
        this.ctx.translate(-offset_x, -offset_y);
      }
    }
    this.aggrObjArea += currObjArea;
  }


  renderImage(index?: number, startEdit?: boolean) {
    if (this.currImageIndex !== index) {
      this.edit = false;
    }
    if (startEdit !== undefined) {
      this.edit = startEdit;
    }

    if (index !== undefined) {
      this.currImageIndex = index;
    }

    var img = new Image();

    // this.undoList = this.savedImageArr[this.currImageIndex]['undoStack'].slice();
    // this.redoList = this.savedImageArr[this.currImageIndex]['redoStack'].slice();
    if (this.savedImageArr[this.currImageIndex]) {
      img.src = this.savedImageArr[this.currImageIndex].src
    } else {
      img.src = this.canvas.toDataURL();
    }
    // this.sources.push(img.src);
    // }
    img.onload = function () {
      this.ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize, 0, 0, this.canvasSize, this.canvasSize);
      this.drawImageScaled(img, this.ctxTwo)
      // this.ctxTwo.drawImage(img, 0, 0, img.width,    img.height, 0, 0, this.canvasSizeTwo, this.canvasSizeTwo);
      this.renderDone = true;
      this.loader.nativeElement.style.visibility = "hidden";
      this.ready = true;
    }.bind(this);


  }
  drawImageScaled(img, ctx) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    console.log('canvas width', canvas.width);

    console.log('canvas height', canvas.height);

    var ratio = Math.min(hRatio, vRatio);
    console.log('ratio width', img.width * ratio);
    console.log('ratio height', img.height * ratio);
    // centerShift_x,centerShift_y
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
      centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
  }
  saveCurrentArt(isNew?: boolean, startEdit?: boolean, source?: string) {
    // const copyOfUndo = this.undoList.slice();
    // const copyOfRedo = this.redoList.slice();
    // default
    let edit = true;
    if (isNew) {
      edit = false;
    }
    // const imgObj = {
    // 'name': newIndex + 'index',
    // 'src': this.canvas.toDataURL(),
    // 'edit': edit, 'redoStack': copyOfRedo, 'undoStack': copyOfUndo, 'redoStackShape': copyOfRedoShape, 'undoStackShape': copyOfUndoShape
    // };
    let newSource = this.canvas.toDataURL();
    if (source) {
      newSource = source;
    }
    const imgObj = {
      'name': this.savedImageArr.length + 'index',
      'src': newSource, 'favorite': false
    };
    // const tempSources = this.sources;
    // tempSources.push(imgObj.src);
    let res = true;
    // if (!source && !this.user) {
    // res = this.saveToLocal('currImage', tempSources);
    // } else {
    // add to user libary
    // if (this.user) {
    // }
    // }
    // if (res) {
    isNew = true;
    if (isNew) {
      this.savedImageArr.push(imgObj);
    } else {
      this.savedImageArr[this.currImageIndex] = imgObj;
    }

    this.currImageIndex = this.savedImageArr.length - 1;
    this.saveImageFirebase(imgObj);

    if (startEdit !== undefined) {
      startEdit = startEdit;
    }

    // } else {
    // this.currImageIndex = this.savedImageArr.length - 1;
    // this.renderImage(this.currImageIndex);
    // this.openStorageFullDialog();
    // }
    this.loader.nativeElement.style.visibility = "hidden";
    this.renderDone = true;
    this.renderImage();
  }
  toggleEdit() {
    this.edit = !this.edit;
    if (this.edit) {
      this.ctx.save();
    } else {
      this.ctx.restore();
    }
  }

  filterFavorites() {
    this.favoritesArr = this.savedImageArr.filter(imgObj => {
      if (imgObj.favorite) {
        return imgObj;
      }
    });
    this.showFavorites = !this.showFavorites;
  }
  delete(imageObj, index?: number) {

    if (index === undefined) {
      index = this.currImageIndex;
    }
    if (index < this.currImageIndex) {
      this.currImageIndex--;
    }
    if (this.user) {
      const trimmedName = this.email;
      console.log('imageobj name', imageObj.name);
      this.database.collection('users/' + trimmedName + '/images').doc(imageObj.name).delete().then(function (docRef) {
        console.log('Successfully deleted');
      })
        .catch(function (error) {
          console.error('Error adding document: ', error);
        });
    }
    // this.sources.splice(index, 1);
    // this.saveToLocal('currImage', this.sources);

    this.savedImageArr.splice(index, 1);
    if (index > this.savedImageArr.length - 1) {
      index--;
      this.renderImage(index);
    }

    if (index === this.currImageIndex || index === 0) {
      this.renderImage(index);
    }
  }

  // end layer undo redo stuff
  setUndoRedo(clear) {
    if (clear) {
      this.undoList = [];
    }
    this.undoList.push(this.canvas.toDataURL());
    this.redoList = [];
    this.disableCheck();
  }

  undo() {
    if (this.undoList.length > 1) {
      var redoState = this.undoList.pop();
      this.redoList.push(redoState);
      var restoreState = this.undoList[this.undoList.length - 1].slice();
      var img = new Image();
      img.src = restoreState;
      this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
      img.onload = function () {
        this.ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize, 0, 0, this.canvasSize, this.canvasSize);
        this.disableCheck();
        this.saveCurrentArt(false);
      }.bind(this);
    }

  }
  disableCheck() {
    if (this.redoList.length === 0) {
      this.disableRedo = true;
    } else {
      this.disableRedo = false;
    }
    if (this.undoList.length <= 1) {
      this.disableUndo = true;
    } else {
      this.disableUndo = false;
    }
  }
  saveImageFirebase(imageObj) {
    let trimmedName = this.guid;
    if (this.user) {
      this.email = this.user.email;
      trimmedName = this.email;
    }

    if (this.byteCount(imageObj.src) > 1048487) {
      let tooLong = true;
      let compSize = 1.0;
      while (tooLong && (compSize > 0)) {
        if (this.byteCount(imageObj.src) > 1048487) {
          const canvasSrc = this.canvas.toDataURL("image/jpeg", compSize);
          if (this.byteCount(canvasSrc) <= 1048487) {
            imageObj.src = canvasSrc;
            tooLong = false;
          } else {
            imageObj.src = canvasSrc;
            compSize = compSize - .01;
          }
        }
      }
    }

    this.database.collection('users/' + trimmedName + '/images').doc(imageObj.name).set({
      'name': imageObj.name, 'src': imageObj.src, 'favorite': false
    }).then(function (docRef) {
      // console.log('Document written with ID: ', docRef.id);
    }).catch(function (error) {
      console.error('Error adding document: ', error);
    });
  }

  saveToFavorites(imageObj, index) {
    let val = true;
    if (this.savedImageArr[index].favorite) {
      val = false;
    }

    this.savedImageArr[index].favorite = val;

    let trimmedName = this.guid;
    if (this.user) {
      trimmedName = this.email;
    }


    this.database.collection('users/' + trimmedName + '/images').doc(imageObj.name).set({
      'name': imageObj.name, 'src': imageObj.src, 'favorite': val
    }).then(function (docRef) {
      // console.log('Document written with ID: ', docRef.id);
    }).catch(function (error) {
      console.error('Error adding document: ', error);
    });
  }


  download(element) {
    element.href = this.canvas.toDataURL();
    return;
  }
  redo() {
    if (this.redoList.length) {
      var restoreState = this.redoList.pop();
      var img = new Image();
      img.src = restoreState;
      this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
      img.onload = function () {
        this.ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize, 0, 0, this.canvasSize, this.canvasSize);
        this.undoList.push(this.canvas.toDataURL());
        this.disableCheck();
        this.saveCurrentArt(false);
      }.bind(this);
    }

  }
  // end layer undo redo stuff
  // end general undo redo stuff

  getDistance(x1, y1, x2, y2) {
    var xs = x2 - x1,
      ys = y2 - y1;
    xs *= xs;
    ys *= ys;
    return Math.sqrt(xs + ys);
  }
  calcPolygonArea(vertices) {
    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i].x;
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1].y;
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1].x;
      var subY = vertices[i].y;

      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }

    return Math.abs(total);
  }

  //BBOOK WUZ HERE
  getRandomColorArr() {
    let counter = 0;
    var colorArr = [];
    while (counter <= this.objNum + 1) {
      var tempRgb = this.getRandomRgb();
      var tempRgbString = 'rgb(' + tempRgb.r + ',' + tempRgb.g + ',' + tempRgb.b + ')';
      colorArr.push(tempRgbString);
      counter++;
    }
    return colorArr;
  }

  getRandomRgb() {
    var num = Math.round(0xffffff * Math.random());
    var r = num >> 16;
    var g = num >> 8 & 255;
    var b = num & 255;
    return { 'r': r, 'g': g, 'b': b };
  }
  // helpers
  getGuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
  byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
  }
  randomlyChooseOneOrTwo() {
    const num = Math.random() + 1;
    if (num < 1.5) {
      return 1;
    } else {
      return 2;
    }
  }

  randomlyChooseTrueOrFalse() {
    const num = Math.random() + 1;
    if (num < 1.5) {
      return false;
    } else {
      return true;
    }
  }

  randomlyChooseTrueOrFalseThird() {
    const num = Math.random() + 3;
    if (num < 1.5) {
      return true;
    } else {
      return false;
    }
  }
  // end utility
  // old local storage stuff *could come in handy*
  // @Component({
  //   templateUrl: './storage-full.component.html'
  // })
  // export class StorageFullDialogComponent {
  //   constructor() {
  //   }
  // }
  // getFromLocal(key: string): any {
  //   let item = this.localStorage.getItem(key);
  //   if (item && item !== "undefined") {
  //     return JSON.parse(this.localStorage.getItem(key));
  //   }

  //   return;
  // }
  // saveToLocal(key: string, value: any) {
  //   try {
  //     // this.localStorage.setItem(key, null);
  //     this.localStorage.setItem(key, JSON.stringify(value));
  //     return true;
  //   } catch (e) {
  //     if (e.code === 22) {
  //       console.log('storage full');
  //     }
  //     // this.localStorage.setItem(key, null);
  //     return false;
  //   }

  // }
  // deleteFromLocal(key: string) {
  //   this.localStorage.removeItem(key);
  // }

  // openStorageFullDialog() {
  //   if (!document.getElementById('storage')) {

  //     this.dialogRef = this.dialog.open(StorageFullDialogComponent, {
  //       width: '300px'
  //     });
  //     this.dialogRef.afterClosed().subscribe(result => {
  //       if (result) {
  //         this.handleSignedOutUser();
  //       }
  //     });
  //   }
  // }

  // old fields
  // sources = [];
  // maxArea = (700 * 700);
  // redoListShape = [];
  // undoListShape = [];
  // undoListShapeTemp = [];
  // redoListShapeTemp = [];
  // colorSchemes = ['Monochromatic', 'Complementary', 'Random'];
  // colorSchemes = ['Monchromatic', 'Complementary', 'Analogous', 'Triad', 'Tetrad',
  // 'Split Complementary'];
  // shapeArr = ['Rectangle', 'Triangle', 'Circle', 'Trapezoid', 'Line'];
  // shapeArr = ['Trapezoid'];
  // end old fields



  // not in use - but working code
  // RGB2HSV(rgb) {
  // var hsv;
  // hsv = new Object();
  // var max = Math.max(rgb.r, rgb.g, rgb.b);
  // var dif = max - Math.min(rgb.r, rgb.g, rgb.b);
  // hsv.saturation = (max == 0.0) ? 0 : (100 * dif / max);
  // if (hsv.saturation == 0) hsv.hue = 0;
  // else if (rgb.r == max) hsv.hue = 60.0 * (rgb.g - rgb.b) / dif;
  // else if (rgb.g == max) hsv.hue = 120.0 + 60.0 * (rgb.b - rgb.r) / dif;
  // else if (rgb.b == max) hsv.hue = 240.0 + 60.0 * (rgb.r - rgb.g) / dif;
  // if (hsv.hue < 0.0) hsv.hue += 360.0;
  // hsv.value = Math.round(max * 100 / 255);
  // hsv.hue = Math.round(hsv.hue);
  // hsv.saturation = Math.round(hsv.saturation);
  // return hsv;
  // }

  // RGB2HSV and HSV2RGB are based on Color Match Remix [http://color.twysted.net/]
  // which is based on or copied from ColorMatch 5K [http://colormatch.dk/]
  // HSV2RGB(hsv) {
  // var rgb = { 'r': null, 'g': null, 'b': null }
  // if (hsv.saturation == 0) {
  // rgb['r'] = Math.round(hsv.value * 2.55);
  // rgb['g'] = Math.round(hsv.value * 2.55);
  // rgb['b'] = Math.round(hsv.value * 2.55);
  // } else {
  // hsv.hue /= 60;
  // hsv.saturation /= 100;
  // hsv.value /= 100;
  // var i = Math.floor(hsv.hue);
  // var f = hsv.hue - i;
  // var p = hsv.value * (1 - hsv.saturation);
  // var q = hsv.value * (1 - hsv.saturation * f);
  // var t = hsv.value * (1 - hsv.saturation * (1 - f));
  // switch (i) {
  // case 0: rgb.r = hsv.value; rgb.g = t; rgb.b = p; break;
  // case 1: rgb.r = q; rgb.g = hsv.value; rgb.b = p; break;
  // case 2: rgb.r = p; rgb.g = hsv.value; rgb.b = t; break;
  // case 3: rgb.r = p; rgb.g = q; rgb.b = hsv.value; break;
  // case 4: rgb.r = t; rgb.g = p; rgb.b = hsv.value; break;
  // default: rgb.r = hsv.value; rgb.g = p; rgb.b = q;
  // }
  // rgb.r = Math.round(rgb.r * 255);
  // rgb.g = Math.round(rgb.g * 255);
  // rgb.b = Math.round(rgb.b * 255);
  // }
  // return rgb;
  // }
  // getStroke(scheme, color): any {
  // switch (scheme) {
  // case 'Random':
  // return this.getRandomRgb();
  // }
  // }
  // hueShift(h, s) {
  // h += s; while (h >= 360.0) h -= 360.0; while (h < 0.0) h += 360.0; return h;
  // }
  // min3(a, b, c) {
  // return (a < b) ? ((a < c) ? a : c) : ((b < c) ? b : c);
  // }
  // max3(a, b, c) {
  // return (a > b) ? ((a > c) ? a : c) : ((b > c) ? b : c);
  // }
  // componentToHex(c) {
  // var hex = c.toString(16);
  // return hex.length == 1 ? "0" + hex : hex;
  // }
  // rgbToHex(r, g, b) {
  // return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  // }

  // convertFromRgbStringToObj(rgbString) {
  // var rgbStringArr = rgbString.split(',');
  // var r = rgbStringArr[0].substring(4);
  // r = r.substring(0, r.length - 1);
  // var g = rgbStringArr[1]
  // g = g.substring(0, g.length - 1);
  // var b = rgbStringArr[2];
  // b = b.substring(0, b.length - 1);
  // return { 'r': r, 'g': g, 'b': b };
  // }

  // utility stuff
  // convertToRgbString(rgbObj) {
  // return 'rgb(' + rgbObj.r + ',' + rgbObj.g + ',' + rgbObj.b + ')';
  // }
  // isLineWidthArrMostlyThick(lineWidthArr) {
  // let widthCounter = 0;
  // for (let lineWidth of lineWidthArr) {
  // if (lineWidth > 6) {
  // widthCounter++;
  // }
  // }
  // (widthCounter / lineWidthArr.length) > .75;
  // return true;
  // }

  // revertChanges() {
  // this.undoListShapeTemp = [];
  // this.redoListShapeTemp = [];

  // }
  // undoShape() {

  // if (!this.startEditing && !this.savedImageArr[this.currImageIndex]['edit']) {
  // this.savedImageArr[this.currImageIndex]['edit'] = true;
  // this.saveCurrentArt(true, true);
  // } else {


  // if (this.undoListShape.length > 1) {
  // var redoState = this.undoListShape.pop();
  // this.redoListShape.push(redoState);
  // var restoreState = this.undoListShape[this.undoListShape.length - 1];
  // var img = new Image();
  // img.src = restoreState;
  // this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
  // img.onload = function () {
  // this.ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize, 0, 0, this.canvasSize, this.canvasSize);
  // this.saveCurrentArt();

  // }.bind(this);
  // }
  // }
  // this.startEditing = true;
  // }
  // redoShape() {
  // if (!this.startEditing && !this.savedImageArr[this.currImageIndex]['edit']) {
  // this.savedImageArr[this.currImageIndex]['edit'] = true;
  // this.saveCurrentArt(true);
  // }
  // this.startEditing = true;

  // if (this.redoListShape.length > 1) {
  // var restoreState = this.redoListShape.pop();
  // var img = new Image();
  // img.src = restoreState;
  // this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
  // img.onload = function () {
  // this.ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize, 0, 0, this.canvasSize, this.canvasSize);
  // this.undoListShape.push(this.canvas.toDataURL());
  // this.saveCurrentArt(false);

  // }.bind(this);
  // }
  // }
  // end for individual shapes in layer
  // getTetrad() {
  // var scheme = new ColorScheme;
  // scheme.from_hue(21)
  // .scheme('tetrad')
  // .variation('soft');

  // var colors = scheme.colors();
  // return colors;
  // }


  // getComplementaryScheme() {
  // var tempRgb = this.getRandomRgb();
  // var complementaryColorArr = ['rgb(' + tempRgb.r + ',' + tempRgb.g + ',' + tempRgb.b + ')'];
  // let counter = 0;
  // var currRgb = tempRgb;

  // while (counter <= (this.objNum + 200)) {
  // // recursion
  // currRgb = this.getComplementary(currRgb);
  // complementaryColorArr.push(this.convertToRgbString(currRgb));
  // counter++;
  // }
  // return complementaryColorArr;
  // }

  // getComplementary(rgb) {
  // var temphsv = this.RGB2HSV(rgb);
  // temphsv.hue = this.hueShift(temphsv.hue, 180.0);
  // var finRgb = this.HSV2RGB(temphsv);
  // return finRgb;
  // }

  // getMono() {
  // let counter = 0;
  // var tempRgb = this.getRandomRgb();
  // var tempRgbString = 'rgb(' + tempRgb.r + ',' + tempRgb.g + ',' + tempRgb.b + ')';
  // var monoColorArr = [];
  // while (counter <= (this.objNum + 600)) {
  // monoColorArr.push(tempRgbString);
  // counter++;
  // }
  // return monoColorArr;
  // }
  //trash- work in progress

  // getAnalogous() {

  // }

  // getTriad() {
  // }
  // / getSplitComplementary() {
  // getLineShape(objNum, norm, rand) {
  // this.shapeArr = ['Line'];
  // while (this.layerCounter < objNum) {

  // this.randomColor = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
  // this.randomStrokeOpacity = Math.random();

  // // randomShapeOpacity = Math.random() * (1) - layerCounter/objNum;
  // this.randomShapeOpacity = Math.random();

  // if (this.randomShapeOpacity < 0) {
  // this.randomShapeOpacity = 0;
  // }
  // if (this.layerCounter === (objNum - 1) && !norm) {
  // this.randomShapeOpacity = .1;
  // }
  // if (this.layerCounter === (objNum - 2) && !norm) {
  // this.randomShapeOpacity = .1;
  // }
  // var randomShape = this.shapeArr[Math.floor(Math.random() * this.shapeArr.length)];
  // // var randomAC = Math.random() * 1;
  // var stroke = this.getStroke(this.randomScheme, this.randomColor);
  // if (this.randomScheme === 'Complementary') {
  // var complStroke = this.colorArr[Math.floor(Math.random() * this.colorArr.length)];
  // this.ctx.strokeStyle = complStroke.substring(0, complStroke.length - 1) + ',' + this.randomStrokeOpacity + ")";
  // } else if (this.randomScheme !== 'Monochromatic') {
  // this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ')';
  // } else {
  // this.ctx.strokeStyle = 'rgb(' + stroke['r'] + ',' + stroke['g'] + ',' + stroke['b'] + ')';
  // }

  // rand = Math.floor(Math.random() * 2) + 1;
  // if (rand === 1) {
  // this.ctx.strokeStyle = 'black';
  // }

  // if (!this.isSafari) {
  // this.randomColor = this.randomColor.substring(0, this.randomColor.length - 1) + ',' + this.randomShapeOpacity + ")";
  // } else {
  // this.ctx.globalAlpha = this.randomShapeOpacity;
  // }
  // this.ctx.fillStyle = this.randomColor;
  // // default is middle
  // let newLineWidth = Math.random() * 5;
  // this.ctx.lineWidth = newLineWidth;
  // this.drawShape(randomShape);
  // this.layerCounter++;
  // }
  // }
  // handleLogOut = function () {
  // this.ref.unauth();
  // }

  // _logUserIn = function (submittedEmail, submittedPassword) {
  // var ref = this.ref
  // var handler = function (error, authData) {
  // if (error) {
  // console.log("Login Failed!", error);
  // } else {
  // console.log("Authenticated successfully with payload:");
  // console.log(authData)
  // location.hash = "dash"
  // }
  // }
  // ref.authWithPassword({
  // email: submittedEmail,
  // password: submittedPassword
  // }, handler);
  // }
  // _signUserUp = function (submittedEmail, submittedPassword) {
  // var ref = this.ref
  // var boundSignerUpper = this._signUserUp.bind(this);
  // var boundLoggerInner = this._logUserIn.bind(this);
  // var storeUser = function (userData) {
  // ref.child('users').child(userData.uid).set({ email: submittedEmail })
  // }
  // var handler = function (error, userData) {
  // if (error) {
  // console.log("Error creating user:", error);
  // DOM.render(<SplashPage error={ error } signerUpper = { boundSignerUpper } loggerInner = { boundLoggerInner } />, document.querySelector('.container'))
  // } else {
  // console.log("Successfully created user account with uid:", userData.uid);
  // storeUser(userData)
  // boundLoggerInner(submittedEmail, submittedPassword)
  // }
  // }
  // ref.createUser({
  // email: submittedEmail,
  // password: submittedPassword
  // }, handler);
  // }
  // old htmal
  //   <div #storage style="margin: auto; z-index: 100">

  //   <button class="material-text float-right hover" style="min-width: 0px !important; margin-right: -20px !important; margin-top: -20px !important; opacity: .5"
  //     mat-icon-button [mat-dialog-close]="false">X</button>
  //   <span>
  //     <h2 class="material-text" mat-dialog-title>  Your library is full!

  //     </h2>
  //     <mat-dialog-content>
  //  Sign In To Save More Images
  //  <button [mat-dialog-close]="true" mat-button>
  //    Sign In 
  // </button>

  //     </mat-dialog-content>
  //   </span>
  // </div>
}

