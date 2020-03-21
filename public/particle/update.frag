precision highp float;

uniform sampler2D u_particles;
varying vec2 v_tex_pos;


void main() {
    vec4 color = texture2D(u_particles, v_tex_pos);
    vec2 pos = vec2(
        color.r / 255.0 + color.b,
        color.g / 255.0 + color.a); // decode particle position from pixel RGBA

    // update particle position, wrapping around the date line
    pos = fract(1.0 + pos + 0.002); // TODO:

    // encode the new particle position back into RGBA
    gl_FragColor = vec4(
        fract(pos * 255.0),
        floor(pos * 255.0) / 255.0);
}
