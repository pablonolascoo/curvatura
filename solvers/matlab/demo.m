% Corte z = 0 de la expansión de Alcubierre, como la figura 1 del paper original.
[X, Y] = meshgrid(linspace(-2.5, 2.5, 200));
[theta, ~] = alcubierre_field(X, Y, zeros(size(X)), 1, 1, 8);
surf(X, Y, theta, 'EdgeColor', 'none'); view(-35, 30); axis tight;
xlabel('x'); ylabel('\rho'); zlabel('\theta');
