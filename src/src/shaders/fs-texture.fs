varying highp vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform int uDoTexturing;

void main(void) {
    if (uDoTexturing == 1){
        gl_FragColor = texture2D( uSampler, vec2(vTextureCoord.s, vTextureCoord.t) );
    }else{
        gl_FragColor = vec4(1.0, 0.1, 0.1, 1.0);
    }
}