precision mediump float;

uniform float radius;
uniform vec2 target;
uniform sampler2D texture;
varying vec2 v_tex_pos;

float pixelSize = 1.0 / radius;
const float personHeight = 1.0; // [m]


// Decode RGB values to elevation [m];
float decode(vec3 v) {
    float u = 2.55; // resolution [m]
    float x = pow(2.0, 16.0) * v.r + pow(2.0, 8.0) * v.g + v.b;

    // Return 0.0 if NA
    float height = 0.0;
    if (x < pow(2.0, 23.0)) {
        height = x * u;
    } else {
        height = (x - pow(2.0, 24.0)) * u;
    }

    return height; // [m]
}


// Get height[m] at given position (0-1) from elevation texture
float getHeight(vec2 pos) {
    vec4 tex = texture2D(texture, vec2(pos.x, 1.0 - pos.y)); // Flip y
    return decode(tex.rgb);
}


// Check if given target is visible from current pixel (v_tex_pos)
bool visible(vec2 target) {
    bool result = true;

    vec2 point = v_tex_pos;
    float targetHeight = getHeight(target);
    float pixelHeight = getHeight(v_tex_pos) + personHeight;
    vec2 diff = target - v_tex_pos; // 0-1
    vec2 absDiff = abs(diff);
    vec2 signDiff = sign(diff);
    float ix = 0.0;
    float iy = 0.0;

    // Move and scan pixels to the target, using line-drawing algorithm
    // https://www.redblobgames.com/grids/line-drawing.html#stepping
    for (int i=0; i < 10000; i++) { // Workaround: substitute for while(true)
        if (((0.5 + ix) / absDiff.x) < ((0.5 + iy) / absDiff.y)) {
            // next step is horizontal
            point = vec2(point.x + pixelSize * signDiff.x, point.y);
            ix = ix + pixelSize;
        } else {
            // next step is vertical
            point = vec2(point.x, point.y + pixelSize * signDiff.y);
            iy = iy + pixelSize;
        }

        float midHeight = getHeight(point);
        float distRatio = length(point - v_tex_pos) / length(diff);
        float interpolatedHeight = mix(pixelHeight, targetHeight, distRatio);
        if (interpolatedHeight < midHeight) {
            result = false; // Target is hidden by the current pixel
            break;
        }
        // When reached around to the target, finish scanning
        if (((absDiff.x - ix) < 0.0001) && ((absDiff.y - iy) < 0.0001)) break;
    }

    return result;
}


void main() {
    float height = getHeight(v_tex_pos);
    float r = visible(target) ? 0.2 : 0.0;
    gl_FragColor = vec4(r, 0.0, 0.0, 1.0-(height - 500.0)/1000.0);

    // Draw point around target
    if (length(v_tex_pos - target) < 2.0 / 255.0) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
}
