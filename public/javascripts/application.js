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


var IChainRunner = Class.extend({
  init: function(isDancing){
    this.dancing = isDancing;
  },

  addChainStep : function(step/*IChainStep*/){
  },
  processChain : function(){
  },
  chainComplete : function(){
  },
  chainInterruption : function(message/* string */){
  },
  getLastRunStepIndex : function(){
  },
  addCompleteHandler: function(/*ChainExitEvent.Handler*/ handler){
    /* must return HandlerRegistration*/
  },
});
 

var ChainManager = IChainRunner.extend({

  init: function(/**/contextData){
    this.context = new ChainContext(contextData);
    this.context.setRunner(this);
  },
  processChain : function(){
    this.firstStep.processStep();
  },	
  addChainStep : function(/*IChainStep*/ step){
    if(!this.firstStep){
      this.firstStep = step;
    }
    if(this.lastStep){
      this.lastStep.setNextStep(step);
    } 
    this.lastStep = step;
    this.lastStep.setContext(this.context);
  },
  addCompleteHandler: function(/*ChainExitEvent.Handler*/ handler){
    /*HandlerRegistration*/
    /*return eventBus.addHandler(ChainExitEvent.TYPE, handler);*/
    $('body').bind('chainexitevent', handler);    
  },
  chainComplete : function(){
    //eventBus.fireEvent(new ChainExitEvent(true));
    $('body').trigger('chainexitevent', [true]);
  },
  chainInterruption : function(/*String*/ message) {
    $('body').trigger('chainExitEvent', [false, message]);
  },
  getLastRunStepIndex : function() {
    return this.context.getLastRunStepIndex();
  },
  getContextData : function(){
    return this.context.getContextData();
  }
});

var IChainContext = Class.extend({
  init : function(){},
  chainComplete : function(){},
  chainInterruption : function(/*String*/ message){},
  setRunner : function(/*IChainRunner<T>*/ runner){},
  incrementStepCounter : function(){},
  getLastRunStepIndex : function(){},
  getContextData : function(){},
  setContextData : function(data){}
});

var ChainContext = IChainContext.extend({

  init: function(data){
    this.data = data;
  },
  setRunner : function(/*IChainRunner<T>*/ runner){
    this.runner = runner;
  },
  getContextData : function(){
    return this.data;
  },
  setContextData : function(data) {
    this.data = data;
  },
  incrementStepCounter : function(){
    this.currentStepIndex++;
  },
  getLastRunStepIndex : function(){
    return this.currentStepIndex;
  },
  chainComplete : function() {
    this.runner.chainComplete();
  },
  chainInterruption : function(/*String*/ message) {
    this.runner.chainInterruption(message);
  }
});

var IChainStep = Class.extend({
  init : function(){},
  processStep : function(){},
  setContext : function(/*IChainContext<T>*/ context){},
  setNextStep : function(/*IChainStep<T>*/ step){},
  getNextStep : function(){}
});

var AbstractStep = IChainStep.extend({
  init : function(){},	
  processStep : function(){},
  processNext : function(){
    if(!this.nextStep){
      this.context.chainComplete();
    }else{
      this.context.incrementStepCounter();
      this.nextStep.processStep();
    } 
  },
  interruptStep : function(/*String*/ message){
    this.context.chainInterruption(message);
  },
  setContext : function(/*IChainContext<T>*/ context){
    this.context = context;
  },
  getContext : function(){
    return this.context;
  },
  setNextStep : function(/*IChainStep<T>*/ step){
    this.nextStep = step;
  },
  getNextStep : function(){
    return this.nextStep;
  },
  getContextData : function(){
    return this.context.getContextData();
  }
});

var ValidateBuzzSuportStep = AbstractStep.extend({
  init : function(){},
  processStep : function(){
    alert('ValidateBuzzSuportStep');
    if (!buzz.isSupported()) {
      alert("Your browser is too old, time to update!");
      this.interruptStep("Your browser is too old, time to update!");
    }
    if (!buzz.isWAVSupported()) {
      alert("Your browser doesn't support WAV Format.");
      this.interruptStep("Your browser doesn't support WAV Format.");
    }
    if (!buzz.isOGGSupported()) {
      alert("Your browser doesn't support OGG Format.");
      this.interruptStep("Your browser doesn't support OGG Format.");
    }
    if (!buzz.isAACSupported()) {
      alert("Your browser doesn't support AAC Format.");
      this.interruptStep("Your browser doesn't support AAC Format.");
    }
    if (!buzz.isMP3Supported()) {
      alert("Your browser doesn't support MP3 Format.");
      this.interruptStep("Your browser doesn't support MP3 Format.");
    }
    this.processNext();
  }
});

var SetBuzzOptionsStep = AbstractStep.extend({
  init : function(){},
  processStep : function(){
  
    alert('SetBuzzOptionsStep');

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

var SetViewModel = AbstractStep.extend({
  init : function(){},
  processStep : function(){
    var viewModel = {
      buttonClick : function(){
        alert('command was called!');
      },
      play : function(){alert('play!')},
      stop : function(){alert('stop!')},
      rewind : function(){alert('rewind!')},
      forward : function(){alert('forward!')},
      previous : function(){alert('previous!')},
      next : function(){alert('next!')},
          
      playlist : ko.observableArray(),
      addTrack : function(track){
        this.playlist.push(track);
      },
      currentTrack : new track("default name",'default artist','default album','default genre','default year', 'url', 'type', 'picture')
        /*currentTrack : ko.observable('current name')*/
    };
    ko.applyBindings(viewModel);
    this._super.processNext();
  }
});

