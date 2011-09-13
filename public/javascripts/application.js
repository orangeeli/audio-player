/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};
  
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" && 
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
            
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
            
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
            
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
    
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;
    
    return Class;
  };
})();

var IChainManager = Class.extend({
  init: function(){},
  addChainHandler : function(handler){},
  processChain : function(){},
  chainComplete : function(){},
  chainInterruption : function(message){},
  getLastRunHandlerIndex : function(){},
  addCompleteHandler: function(handler){
  },
});
var ChainManager = IChainManager.extend({
  init: function(contextData){
    this.context = new ChainContext(contextData);
    this.context.setRunner(this);
  },
  processChain : function(){
    this.firstHandler.processHandler();
  },	
  addChainHandler : function(handler){
    if(!this.firstHandler){
      this.firstHandler = handler;
    }
    if(this.lastHandler){
      this.lastHandler.setNextHandler(handler);
    } 
    this.lastHandler = handler;
    this.lastHandler.setContext(this.context);
  },
  addCompleteHandler: function(handler){
    $('body').bind('chainexitevent', handler);    
  },
  chainComplete : function(){
    $('body').trigger('chainexitevent', [true]);
  },
  chainInterruption : function(message) {
    $('body').trigger('chainExitEvent', [false, message]);
  },
  getLastRunHandlerIndex : function() {
    return this.context.getLastRunHandlerIndex();
  },
  getContextData : function(){
    return this.context.getContextData();
  }
});
var IChainContext = Class.extend({
  init : function(){},
  chainComplete : function(){},
  chainInterruption : function(message){},
  setRunner : function(runner){},
  incrementHandlerCounter : function(){},
  getLastRunHandlerIndex : function(){},
  getContextData : function(){},
  setContextData : function(data){}
});
var ChainContext = IChainContext.extend({
  init: function(data){
    this.data = data;
  },
  setRunner : function(runner){
    this.runner = runner;
  },
  getContextData : function(){
    return this.data;
  },
  setContextData : function(data) {
    this.data = data;
  },
  incrementHandlerCounter : function(){
    this.currentHandlerIndex++;
  },
  getLastRunHandlerIndex : function(){
    return this.currentHandlerIndex;
  },
  chainComplete : function() {
    this.runner.chainComplete();
  },
  chainInterruption : function(message) {
    this.runner.chainInterruption(message);
  }
});
var IChainHandler = Class.extend({
  init : function(){},
  processHandler : function(){},
  setContext : function(context){},
  setNextHandler : function(handler){},
  getNextHandler : function(){}
});
var AbstractHandler = IChainHandler.extend({
  init : function(){},	
  processHandler : function(){},
  processNext : function(){
    if(!this.nextHandler){
      this.context.chainComplete();
    }else{
      this.context.incrementHandlerCounter();
      this.nextHandler.processHandler();
    } 
  },
  interruptHandler : function(message){
    this.context.chainInterruption(message);
  },
  setContext : function(context){
    this.context = context;
  },
  getContext : function(){
    return this.context;
  },
  setNextHandler : function(handler){
    this.nextHandler = handler;
  },
  getNextHandler : function(){
    return this.nextHandler;
  },
  getContextData : function(){
    return this.context.getContextData();
  }
});
var ValidateBuzzSuportHandler = AbstractHandler.extend({
  init : function(){},
  processHandler : function(){
    if (!buzz.isSupported()) {
      this.interruptStep("Your browser is too old, time to update!");
    }
    if (!buzz.isWAVSupported()) {
      this.interruptHandler("Your browser doesn't support WAV Format.");
    }
    if (!buzz.isOGGSupported()) {
      this.interruptHandler("Your browser doesn't support OGG Format.");
    }
    if (!buzz.isAACSupported()) {
      this.interruptHandler("Your browser doesn't support AAC Format.");
    }
    if (!buzz.isMP3Supported()) {
      this.interruptHandler("Your browser doesn't support MP3 Format.");
    }
    this.processNext();
  }
});
var SetBuzzOptionsHandler = AbstractHandler.extend({
  init : function(){},
  processHandler : function(){
    // Preload the sound
    // auto, metadata, none
    buzz.defaults.preload = 'auto';
    // Play the sound when ready
    // bool
    buzz.defaults.autoplay = false;
    // Loop the sound
    // bool
    buzz.defaults.loop = false;
    // value to display when a time convertion is impossible
    buzz.defaults.placeholder = '--';
    // Duration of a fading effect
    // milliseconds
    buzz.defaults.duration = 5000; 
    // Audio formats of your files
    buzz.defaults.formats = ['ogg', 'mp3', 'aac', 'wav'];
    this.processNext();
  }
});
var SetViewModelHandler = AbstractHandler.extend({
  init : function(){},
  processHandler : function(){
    function track(trackName, trackArtist, trackAlbum, trackGenre, trackYear, trackUrl, trackType, trackImageUrl, trackSound){
      return {
        name : trackName,
        artist : trackArtist,
        album : trackAlbum,
        genre : trackGenre,
        year : trackYear,
        type : trackType,
        url : trackUrl,
        image : trackImageUrl,
        sound : trackSound
      }
    }
    

    var changeTrackObj = {
      changeTrackPrev : function(playCounter, clb){
          return function(){
            if((playCounter-1) < 0){
              //this.next();
              clb();
              return;
            }
            playCounter = playCounter-1;
            return playCounter;
          }
      },

      changeTrackNext : function(playCounter, playListLength, clb){
          return function(){
            if((playCounter+1) > playListLength){
              //this.previous();
              clb();
              return;
            }
            playCounter = playCounter+1;
            return playCounter;
          }
      }
    };

    var viewModel = {
      play : function(){
        this.currentTrack.sound.play();
      },
      stop : function(){
        this.currentTrack.sound.stop();
      },
      rewind : function(){alert('rewind!')},
      forward : function(){alert('forward!')},
      previous : function(){
        var clbPrev = (function(viewM, pos){
          return function(){
            viewM.changeTrack(null, pos)
          }
        }(this, this.playlist.length-1));
        this.changeTrack(changeTrackObj.changeTrackPrev(this.playerCounter, clbPrev));
      },
      next : function(){
        var clbNext = (function(viewM, pos){
          return function(){
            viewM.changeTrack(null, pos);
          }
        }(this, 0));
        playListLength = this.playlist.length-1;
        this.changeTrack(changeTrackObj.changeTrackNext(this.playerCounter, playListLength, clbNext));
      },
      continuousPlay : true,    
      playlist : [],//ko.observableArray(),
      playerCounter : 0, //ko.observable(0),
      addTrack : function(track){
        this.playlist.push(track);
      },
      removeTrack : function(){
        this.playlist.pop(track);
      },
      /*currentTrack : ko.observable(),*/
      changeTrack : function(f, pos){
        var trackNumber = typeof f == "function" ? f(): pos;
        if(typeof trackNumber == "undefined"){
          // this guard shouldn't be needed. understand why this method is called twice and why the second the values come undefined
          return;
        }
        // stop current music
        this.stop();
        this.currentTrack = this.playlist[trackNumber];
        this.playerCounter = trackNumber;
        // start playing new one if it was playing some previously
        this.play();
      }
    };

    viewModel.currentTrack = ko.observable();

    var bear = new buzz.sound("tracks/BEARBOT-NYC", { formats: [ 'mp3' ] });
    var valerna = new buzz.sound("tracks/Valerna-Combination-Pizza-Hut-And-Taco-Bell", { formats: [ 'mp3' ] });
   
    bear.bind("ended", function(e) {
      $('body').trigger("trackEnded");
    });
   
    valerna.bind("ended", function(e) {
      $('body').trigger("trackEnded");
    });

    $('body').bind('trackEnded', function(){
      if(viewModel.continuousPlay){
        viewModel.next();
        viewModel.play();
      }
    });

    var bearTrack = new track('NYC', 'Bear Bot', '', 'Electro Pop', '2009', 'tracks/BEARBOT-NYC.mp3', 'audio/mp3', 'images/coolMonkey.png', bear);
    var valernaTrack = new track('Combination of pizza hut and taco bell', 'Valerna', '', 'Electro Pop', '2009', 
                                       'tracks/Valerna-Combination-Pizza-Hut-And-Taco-Bell.mp3', 'audio/mp3', 'images/coolMonkey.png', valerna);
    viewModel.addTrack(bearTrack);
    viewModel.addTrack(valernaTrack);

    viewModel.currentTrack = bearTrack;
    ko.applyBindings(viewModel);
    this.processNext();
  }
});

