precision mediump float;

uniform sampler2D prevState;
uniform float radius;
uniform float k;
uniform float omega;
varying vec2 v_tex_pos;

float dt = 0.001;

void main() {
  // Previous phase of this pixel
  float theta = texture2D(prevState, v_tex_pos).r;

  float N = 9.0;
  float theta_dot = omega;

  // Fireflies can only see 8-neighbors
  for(int dx=-1; dx<=1; ++dx) {
    for(int dy=-1; dy<=1; ++dy) {
      float theta2 = texture2D(prevState, v_tex_pos + vec2(dx, dy)/radius).r;
      theta_dot += (k / N) * sin(theta2 - theta);
    }
  }

  gl_FragColor = vec4(vec3(fract(theta + dt * theta_dot)), 1);
}
