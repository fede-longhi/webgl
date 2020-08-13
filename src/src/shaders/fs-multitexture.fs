varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform int uDoTexturing;

void main(void) {
    if (uDoTexturing == 1){
        highp vec4 texture1 = texture2D(uSampler, vec2(vTextureCoord.st));
        highp vec4 texture2 = texture2D(uSampler2, vec2(vTextureCoord.st));
        
        gl_FragColor = mix(texture1, texture2, 0.5);
        //gl_FragColor = texture2D( uSampler, vec2(vTextureCoord.s, vTextureCoord.t) );
    }else{
        gl_FragColor = vec4(1.0, 0.1, 0.1, 1.0);
    }
}