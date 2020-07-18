precision mediump float;
uniform sampler2D texture;
uniform float width;
uniform float height;
uniform float time;
varying vec2 v_tex_pos;


vec3 hsvToRgb(float h, float s, float v) {
    // h: 0.0 - 360.0, s: 0.0 - 1.0, v: 0.0 - 1.0
    float c = s; // float c = v * s;
    float h2 = h / 60.0;
    float x = c * (1.0 - abs(mod(h2, 2.0) - 1.0));
    vec3 rgb = (v - c) * vec3(1.0, 1.0, 1.0);

    if (0.0 <= h2 && h2 < 1.0) {
        rgb += vec3(c, x, 0.0);
    } else if (1.0 <= h2 && h2 < 2.0) {
        rgb += vec3(x, c, 0.0);
    } else if (2.0 <= h2 && h2 < 3.0) {
        rgb += vec3(0.0, c, x);
    } else if (3.0 <= h2 && h2 < 4.0) {
        rgb += vec3(0.0, x, c);
    } else if (4.0 <= h2 && h2 < 5.0) {
        rgb += vec3(x, 0.0, c);
    } else if (5.0 <= h2 && h2 < 6.0) {
        rgb += vec3(c, 0.0, x);
    }
    return rgb;
}


// TODO:　流れの向きは明度の傾きとは直交する。反対向きとの区別が難しい。
void main() {
    vec4 tex = texture2D(texture, v_tex_pos);
    vec4 texR = texture2D(texture, vec2(v_tex_pos.x + 1.0 / width, v_tex_pos.y));
    vec4 texU = texture2D(texture, vec2(v_tex_pos.x, v_tex_pos.y + 1.0 / height));
    // gl_FragColor = vec4(texR.rgb - tex.rgb, 1.0); // dX

    float brightness = length(tex.rgb) / sqrt(3.0);
    // gl_FragColor = vec4(vec3(brightness), 1.0); // Grayscale image

    float bR = length(texR.rgb) / sqrt(3.0);
    float bU = length(texU.rgb) / sqrt(3.0);
    float b = length(vec2(brightness - bR, brightness-bU));
    // gl_FragColor = vec4(vec3(b), 1.0); // Magnitude of diff

    float theta = atan(bU-brightness, bR-brightness);
    float thetaDeg = degrees(theta);
    // gl_FragColor = vec4(hsvToRgb(thetaDeg + 180.0, 1.0, 1.0), 1.0); // Hue by angle
    // gl_FragColor = vec4(vec3((sin(theta)+1.0) / 2.0), 1.0); // Grayscale by angle

    // 180deg cycle, animate hue
    vec3 rgb = hsvToRgb(mod(2.0*(thetaDeg + 180.0)+90.0*time, 360.0), 1.0, 1.0);
    // Scale RGB by the original brightness
    gl_FragColor = vec4(rgb * (brightness+0.5)/1.5, 1.0);
}
