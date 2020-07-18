precision mediump float;

uniform sampler2D prevState;
uniform float radius;
uniform float seed;
uniform float beta;
uniform float gamma;
varying vec2 v_tex_pos;

// Constants
// S: [1, 0, 0, 0], I: [0, 1, 0, 0], R: [0, 0, 1, 0], empty: [0, 0, 0, 0]
const vec4 S = vec4(1.0, 0.0, 0.0, 0.0);
const vec4 I = vec4(0.0, 1.0, 0.0, 0.0);
const vec4 R = vec4(0.0, 0.0, 1.0, 0.0);

// pseudo-random generator
const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
float rand(const vec2 co) {
    float t = dot(rand_constants.xy, co);
    return fract(sin(t) * (rand_constants.z + t));
}


void main() {
    // Previous state of this pixel
    vec4 state = texture2D(prevState, v_tex_pos);

    // Update state
    vec4 newState = state;
    if (state.r > 0.9) { // Susceptible
        float n = 0.0; // Number of "Infected" in 8-neighbor
        for(int dx=-1; dx<=1; ++dx) {
            for(int dy=-1; dy<=1; ++dy) {
                vec4 neighbor = texture2D(prevState, v_tex_pos + vec2(dx, dy) / radius);
                n += neighbor.g; // Increment if neighbor is Infected
            }
        }
        // Probability of being infected by at least one neighbor
        float prob = 1.0 - pow(1.0 - beta, n);
        if (rand(seed * v_tex_pos) < prob) {
            newState = I;
        }
    }
    if (state.g > 0.9) { // Infected
        if (rand(seed * v_tex_pos) < gamma) {
            newState = R;
        }
    }
    // Else(R or empty): same as the previous state
    gl_FragColor = newState;
}
