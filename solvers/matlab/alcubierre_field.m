function [theta, rho] = alcubierre_field(X, Y, Z, v, R, sigma)
%ALCUBIERRE_FIELD Expansión y densidad de energía euleriana de Alcubierre (G = c = 1).
%   [theta, rho] = alcubierre_field(X, Y, Z, v, R, sigma)
%   Compatible con MATLAB y GNU Octave. Misma convención que physics/ y solvers/cpp.
%   Para validación cruzada completa usar Warp Factory (Helmerich et al. 2024).
    r = sqrt(X.^2 + Y.^2 + Z.^2);
    s2 = @(u) 4 .* exp(-2 .* abs(u)) ./ (1 + exp(-2 .* abs(u))).^2;
    fp = sigma .* (s2(sigma .* (r + R)) - s2(sigma .* (r - R))) ./ (2 .* tanh(sigma .* R));
    theta = v .* (X ./ max(r, eps)) .* fp;
    rho = -v.^2 .* ((Y.^2 + Z.^2) ./ max(r.^2, eps)) .* fp.^2 ./ (32 * pi);
end
