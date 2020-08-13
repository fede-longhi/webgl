$(document).keyup(function(evt){
    switch(evt.keyCode){
        case 80: //'p'
            paused = !paused;
            break;
        case 84: //'t'
            useTexture = !useTexture;
            if(useTexture){
                gl.uniform1i(glProgram.uDoTexturing, 1);
            }else{
                gl.uniform1i(glProgram.uDoTexturing, 0);	                    	
            }
            break;
        default:
            break;
    }
});