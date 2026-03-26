uniform float uTime;
uniform float uSpeed;

varying vec3 vPosition;

const float PI = 3.1415926535897932384626433832795;

void main() {
    float radius = 3.0;
    float factor = cos(uTime * uSpeed);

    vec3 localPosition = position;
    localPosition.x += sin(uTime * uSpeed) * radius;
    localPosition.z += cos(uTime * uSpeed) * radius;
    localPosition.y += sin(uTime * uSpeed) * radius * factor;

    vPosition = localPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(localPosition, 1.0);

}