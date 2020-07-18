precision mediump float;

uniform sampler2D prevState;
varying vec2 v_tex_pos;

void main() {
    vec4 state = texture2D(prevState, v_tex_pos);

    vec3 color = vec3(1.0, 1.0, 1.0); // Default: empty
    if (state.r > 0.9) { // Susceptible
        color = vec3(0.5, 0.9, 0.9);
    }
    if (state.g > 0.9) { // Infected
        color = vec3(0.9, 0.4, 0.4);
    }
    if (state.b > 0.9) { // Recovered(Removed)
        color = vec3(0.5, 0.5, 1.0);
    }
    gl_FragColor = vec4(color, 1.0);
}
