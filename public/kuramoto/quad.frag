precision mediump float;

uniform sampler2D prevState;
varying vec2 v_tex_pos;

float PI = 3.14159265358979;

void main() {
    float state = texture2D(prevState, v_tex_pos).r;
    float brightness = (sin(2.0 * PI * state) + 1.0) / 2.0;

    gl_FragColor = vec4(vec3(brightness), 1.0);
}
