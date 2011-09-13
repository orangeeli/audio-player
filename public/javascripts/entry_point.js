$(document).ready(function(){
  var manager = new ChainManager({});
  manager.addChainHandler(new ValidateBuzzSuportHandler());
  manager.addChainHandler(new SetBuzzOptionsHandler());
  manager.addChainHandler(new SetViewModelHandler());
  manager.addCompleteHandler(function(isSuccessful, message) {
    if(isSuccessful){
      //alert('chain successfull');
    }else{
      var logMessage = "Couldn't complete bootstrap sequence: " + message;
      alert(logMessage);
    }
  });
  manager.processChain();
});
