precision mediump float;

uniform sampler2D prevState;
uniform float radius;
varying vec2 uv;

void main() {
    float n = 0.0;
    for(int dx=-1; dx<=1; ++dx) {
        for(int dy=-1; dy<=1; ++dy) {
            n += texture2D(prevState, uv+vec2(dx,dy)/radius).r;
        }
    }
    float s = texture2D(prevState, uv).r;
    if(n > 3.0+s || n < 3.0) {
        gl_FragColor = vec4(0,0,0,1);
    } else {
        gl_FragColor = vec4(1,1,1,1);
    }
}
