precision mediump float;
attribute vec2 position;
varying vec2 v_tex_pos;

void main() {
    v_tex_pos = position;
    gl_Position = vec4(2.0 * position - 1.0, 0, 1);
}
