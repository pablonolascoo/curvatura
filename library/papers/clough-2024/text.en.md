# What no one has seen before: gravitational waveforms from warp drive collapse

Katy Clough, Tim Dietrich, Sebastian Khan

> Fuente original: https://arxiv.org/abs/2406.02466
> Publicación: The Open Journal of Astrophysics 7
> Licencia: CC-BY-4.0. © Los autores.
> Conversión automática desde la fuente LaTeX (library/tools/latex2md.py). Revisar antes de citar.

## Abstract

Despite originating in science fiction, warp drives have a concrete description in general relativity, with Alcubierre first proposing a spacetime metric that supported faster-than-light travel. Whilst there are numerous practical barriers to their implementation in real life, including a requirement for negative energy, computationally, one can simulate their evolution in time given an equation of state describing the matter. In this work, we study the signatures arising from a warp drive `containment failure', assuming a stiff equation of state for the fluid. We compute the emitted gravitational-wave signal and track the energy fluxes of the fluid. Apart from its rather speculative application to the search for extraterrestrial life in gravitational-wave detector data, this work is interesting as a study of the dynamical evolution and stability of spacetimes that violate the null energy condition. Our work highlights the importance of exploring strange new spacetimes, to (boldly) simulate what no one has seen before.

## Introduction

Detections of gravitational waves by the LIGO Scientific-Virgo-Kagra Collaborations [e.g.,][]LIGOScientific:2018mvr,LIGOScientific:2020ibl,KAGRA:2021vkt are paving the way to viewing extreme gravitational events across the entire visible universe. It is natural to ask what new signals originating from strongly distorted regions of spacetime could be seen in the future beyond the compact binary mergers already detected. To search for such signals and to correctly identify them in the measured data, it is important to understand their phenomenology and properties. Numerical relativity (NR) is one of the main tools for computing gravitational-wave signals for spacetimes in the highly dynamical strongly gravity regime in the absence of symmetries [4, 5, 6, 7]. NR simulations are time domain evolutions of a given initial state that allow the resulting gravitational-wave signals to be extracted in the asymptotic radiation zone, from which we can connect to our own observations from a given viewing angle and distance.

Unlike black holes, which have a natural formation channel [8, 9] and considerable observational support [10, 11, 12], more exotic spacetimes such as wormholes or warp drives [13, 14] are considered science fiction because their formation and existence generate many potential paradoxes, and require matter that violates certain energy conditions. Nevertheless, warp drives can be described classically within the theory of general relativity by a metric first proposed by Miguel Alcubierre [15] and further developed in subsequent works [e.g.,][]Natario:2001tk,VanDenBroeck:1999sn,Krasnikov:1995ad,Everett:1997hb.

The principle idea behind a warp drive is that instead of exceeding the speed of light directly in a local reference frame, which would violate Lorentz invariance, a “warp bubble” could traverse distances faster than the speed of light (as measured by some distant observer) by contracting spacetime in front of it and expanding spacetime behind it [16]. The problems associated with such spacetimes are well documented [17, 18, 19, 20, 13, 21]. One particular issue is the requirement for matter that violates the Null Energy Condition (NEC) [22, 23]
[^1]. The requirement that warp drives violate the NEC may be considered a practical rather than fundamental barrier to their construction since NEC violation can be achieved by quantum effects and effective descriptions of modifications to gravity [28, 29], albeit subject to quantum inequality bounds [30, 31, 32] and other semiclassical considerations [33] that seem likely to prove problematic. Other issues with the warp drive metric include the potential for closed time-like curves [17, 19] and, from a more practical perspective, the difficulties for those in the ship in controlling and deactivating the bubble [34].

From the perspective of simulating the warp drive dynamically, the key challenge is stability. One can straightforwardly generate the initial metric that describes the Alcubierre metric and infer the instantaneous matter configuration that must support it using the Einstein Equation, but a time-domain evolution of the coupled matter-gravity system necessitates that we specify the equation of state of the matter, which in turn determines how it evolves. In a perfect fluid, this involves specifying the relation between the fluid pressure and density, but in a more general case, the full relation between the stress-energy components must be given. There is (to our knowledge) no known equation of state that would maintain the warp drive metric in a stable configuration over time - therefore, whilst one can require that initially, the warp bubble is constant, it will quickly evolve away from that state and, in most cases, the warp fluid and spacetime deformations will disperse or collapse into a central point.

This instability, whilst undesirable for the warp ship's occupants, gives rise to the possibility of generating gravitational waves. The Alcubierre metric for a constant velocity warp ship would not generate gravitational waves. In addition, far away from the warp bubble, the spacetime is exactly Minkowskian -- that is, it is actually flat, not just asymptotically flat. The warp bubble spacetime is therefore undetectable by its gravitational effects as it has no gravitational wave content and no measurable ADM mass [35]
[^2] (although other signatures are possible, see e.g. [38]).
However, the collapse of the warp drive, or its acceleration or deceleration, should generate gravitational waves, and in this work, we study the first case by allowing the warp bubble to collapse. Physically, this could be related to a breakdown in the containment field that the post-warp civilisation (presumably) uses to support the warp bubble against collapse.

The prospect of a zero ADM mass spacetime radiating gravitational-wave energy immediately leads to an interesting physical question: Does the spacetime actually radiate energy, and if so, once it settles down to a steady state, does the final spacetime have a negative mass? In this work we consider the fluxes of energy both from the matter and the gravitational waves out of a spatial volume after the warp drive collapse. This study has connections to early work by Bondi [3], in which positive and negative matter restricted to linear motion was shown to attract and repel in a way that would accelerate them together.

For our study, we restrict ourselves to a limited and simplified scenario and sub-light speeds as a proof of principle. This is also a first step towards studying what, if any, pathologies develop as we reach $v=c$. We would also emphasise that the warp drive is interesting since it uses gravitational distortion of spacetime to propel the ship forward, rather than a usual kind of fuel/reaction system. This means that its detection would signal the use of NEC violating drives, even in sub-light-speed cases.

The initial bubble is described by the original Alcubierre metric with a fixed wall thickness. We develop a formalism to describe the warp fluid and its evolution and vary its initial velocity at the point of collapse (which is related to the amplitude of the warp bubble). We neglect the existence of the warp ship itself [23], which is assumed to be negligible compared to the bubble.

This article is structured as follows. In Sec. , we set out the formalism used to perform our simulations of warp bubble collapse, particularly the treatment of the warp fluid element and its equation of state. 
In Sec. , we present the resulting gravitational-wave signatures and quantify the radiation of energy from the spacetime region. 
In Sec. , we discuss the implications of our findings and propose directions for further study.
Some technical details and validation of our simulations are given in the Appendix.

![Figura 1](figures/TraceK.png)

**Figura 1.** The evolution in time of the trace of $K_ij$, $K= ^ij K_ij$. This quantity initially provides a schematic representation of the warp drive metric, with positive values for the contracting part of the space ahead of the ship and negative values for the expanding part behind. We observe the destabilisation of these regions, which initially collapse inwards and then dissipate to infinity. Movie at https://youtu.be/rZsre-y4hlM?feature=shared.

## Formalism for the warp drive simulation

We follow the standard numerical-relativity approach to solving the Einstein Equation

$$G_{\mu \nu}= R_{\mu \nu} - \frac{1}{2} R g_{\mu \nu} = 8 \pi T_ {\mu \nu} \tag{1}$$

as an initial value problem, using the $3+1$-decomposed form and setting $G=c=1$. This means that we define spacelike hypersurfaces that foliate the four-dimensional manifold, specify initial data on a particular hypersurface, and evolve it forward in our chosen time coordinate using the method of lines. 
(See the standard numerical relativity texts [39, 40, 5] for detailed discussions.)
The $3+1$-decomposed metric in coordinates adapted to the slicing takes the form

$${\rm d} s^2 = (-\alpha^2 + \beta_i \beta^i) {\rm d} t^2 + 2 \beta_i {\rm d}t {\rm d}x^i + 
\gamma_{ij} {\rm d}x^i {\rm d}x^j, \tag{2}$$

where $\alpha$ is the lapse function, $\beta^i$ is the shift vector, 
and $\gamma_{ij}$ is the spatial metric connected to the spatial hypersurface. The description is completed by the extrinsic curvature $K_{ij}$, which is roughly related to the time derivative of $\gamma_{ij}$, and more rigorously defined as its Lie derivative, such that

$$K_{ij} = - \frac{1}{2 \alpha} \partial_t \gamma_{ij} + D_{(i} \beta_{j)}. \tag{3}$$

It will also be useful to note that $n_\mu = (-\alpha, 0,0,0)$ is the normal to the spatial hypersurface.

### Initial data for the metric

Although, as discussed above, many alternatives with improved physical properties have been discussed in the literature, we will consider in this work the original Alcubierre metric [15] for which

$$\begin{aligned}\alpha & = & 1, \\
\gamma_{ij} & = & \delta_{ij}, \\
\beta^i & = & \left(0, 0, -v_s f(r_s)\right),\end{aligned} \tag{4}$$

with the quantities $r_s$ and $v_s$ defined as

$$v_s = \frac{{\rm d}z_s}{{\rm d}t}, \quad
r_s = \sqrt{x^2+y^2+(z-z_s)^2}, \tag{5}$$

and 

$$f(r_s) = \frac{\tanh(\sigma (r_s +R) )-\tanh(\sigma (r_s -R) )}{2 \tanh(\sigma R)}. \tag{6}$$

The free parameters $R$ and $\sigma$ determine the shape of the warp bubble, specifically its radius and the wall thickness $\sim 1/\sigma$. 

We will use the value of $R$ to define the system of units in which our results are expressed - our simulations have a scaling freedom that means that they apply to any similar warp drive with size $R$. Specifying the physical value of $R$ determines the other physical values of our measurements, including the gravitational-wave fluxes and the energy radiated. For reference, for a warp bubble of size $R=1$ km, the relevant quantities in physical units are $t=1[R]$ is 3.33 $\mu$s and $E$ or $M=1[R]$ is 0.677 $M_\odot$
[^3].

The extrinsic curvature carries the information about the expansion and contraction of the spacetime, with values

$$K_{ij} = \frac{1}{2} \left( \partial_i \beta_j + \partial_j \beta_i \right) \tag{7}$$

that can be computed analytically from the expression for $f(r_s)$. The trace of $K_{ij}$, $K=\gamma^{ij} K_{ij}$ is initially $K=\partial_z \beta^z$. This quantity is usually plotted to provide a schematic representation of the warp drive, see Fig. .

### Initial data for matter

The initial data for the matter degrees of freedom is computed from the energy-momentum-tensor that supports the initial spacetime curvature deformation. 
We describe the state of the matter at any time in terms of projections of the stress-energy tensor

$$\begin{aligned}S_{\mu \nu} & =& P^\sigma_\mu P^\rho_\nu T_{\sigma \rho}, \\
S_\mu& = & - P^\sigma_\mu n^\rho T_{\sigma \rho}, \\
\rho & = & n^\mu n^\nu T_{\mu \nu},\end{aligned} \tag{8}$$

with the projection operator $P^\mu_\nu = \delta^\mu_\nu + n^\mu n_\nu$ where $n^\mu$ is the normal vector to the spatial hypersurface defined above. In coordinates adapted to the slicing, we can work with the ten components

$$\begin{aligned}S_{ij} & =& T_{ij}, \\
S_i& = & -\frac{1}{\alpha} T_{it} + \frac{\beta^j}{\alpha}T_{ij}, \\
\rho & = & \frac{1}{\alpha^2} T_{tt} - 2 \frac{\beta^i}{\alpha^2}T_{it} + \frac{\beta^i\beta^j}{\alpha^2}T_{ij}.\end{aligned} \tag{9}$$

Knowing that the energy-momentum-tensor has to satisfy the Einstein Equation, we can directly calculate the quantities on the right-hand side from Eq. (1) as

$$T_{\mu \nu} = \frac{1}{8 \pi} \left( R_{\mu \nu} - \frac{R}{2} g_{\mu \nu} \right), \tag{10}$$

where the Ricci tensor can be straightforwardly calculated from the Alcubierre metric in terms of derivatives of the shift. 

### Metric evolution

![Figura 2](figures/Weyl.png)

**Figura 2.** The evolution in time of the real part of the Weyl scalar $ _4$ for the case of $v=0.1$. This quantity provides a measure of the spacetime curvature and, in the far region, can be identified with the gravitational wave content of the spacetime. In the last two panels, we see a burst of gravitational-wave radiation leaving the collapsed remnant of the warp bubble. Movie at https://youtu.be/rZsre-y4hlM?feature=shared.

For the metric evolution, we use the standard CCZ4 formulation of [42] and the moving puncture gauge [43, 44, 45, 46] within the numerical-relativity code grchombo [47, 48, 49], which uses the method of lines, with an RK4 time integration and 4th order finite difference stencils for calculating spatial gradients.

We note that for the gauge evolution we use the shock-avoiding Bona-Masso type gauge slicing originally proposed by Alcubierre [50, 51], and recently advocated for by Baumgarte and Hilditch [52] in the context of critical collapse simulations. We find that the shock-avoiding slicing gives much better stability and, more importantly, allows us to extract coherent gravitational waveforms in the wave zone, whereas in the standard gauge, we obtained large unphysical gauge effects that hindered us in extracting the physical gravitational-wave signal. Because this gauge has a tendency to push the extrinsic curvature to zero, one should not over-interpret the evolution shown in Fig. . It quickly decays to zero in the simulation before the matter and gravitational-wave fluxes have begun to leave the volume. 

Better quantities to track the evolution of the metric curvature are the Weyl scalars, in particular $\Psi_4$. We study the tensorial gravitational-wave modes emitted by the warp drive by extracting the Newman-Penrose scalar $\Psi_4$ with the tetrads proposed by [53], projected into spin-weight $-2$ spherical harmonics, $\psi_{lm}=\oint_{S^2}\Psi_4|_{r=r_\mathrm{ex}}\left[{}_{-2}\bar{Y}^{lm}\right]\,\rmd \Omega$, 
where $\rmd \Omega = \sin\theta\,\rmd\theta\,\rmd\varphi$ is the area element on the $S^2$ unit sphere. The evolution of the real part of $\Psi_4$ is illustrated in Fig. .

### Matter evolution

![Figura 3](figures/Rho.png)

**Figura 3.** The evolution in time of the matter energy density $ $ for the case of $v=0.1$. We see that a ring of positive energy forms within the initially negative energy density bubble and propels it outwards, which is reminiscent of Bondi:1957zz. There are several waves of alternating positive and negative energies. In the final panel, we see that the remnant appears stable, and compared to Fig. fig:Weyl, we see that the matter waves propagate at roughly the same speed as the gravitational waves. Movie at https://youtu.be/rZsre-y4hlM?feature=shared.

The requirement that $\nabla_\nu T^{\mu\nu} = 0$ gives us four evolution equations for the components of the matter $\rho$ and $S_i$ as follows: 

$$\partial_t \rho = \beta^i D_i \rho - \gamma^{ij} \frac{1}{\alpha} D_j \left( \alpha^2 S_i \right) + \alpha ( S_{ij} K^{ij} + \rho K), \tag{11}$$

$$\partial_t S_i = \beta^j D_j S_i + S_j D_i \beta^j - \gamma^{jk}D_k (\alpha S_{ij}) + \alpha K S_i - \rho \partial_i \alpha. \tag{12}$$

The evolution equation for $S_{ij}$ is, in principle, free - once we specify the equation of state of the matter, it would be fully determined. We base our choice on the observation that the initial warp drive spacetime has an average pressure of [27]

$$\bar{p} \equiv \gamma^{ij} S_{ij} /3 = \rho - \frac{1}{12\pi} \nabla_a(K n^a) ~, \tag{13}$$

which we can reexpress using the ADM formalism as

$$\bar{p} = \frac{\rho}{3} - \frac{1}{24\pi} \left( \frac{D^2\alpha}{\alpha} + K_{ij} K^{ij} + K^2 \right) ~. \tag{14}$$

We then decompose the stress density tensor as

$$S_{ij} = \bar{p} \gamma_{ij} + \sigma_{ij} \tag{15}$$

where the second term is trace-free by construction and represents the anisotropic stress component (it is initially non-zero for the Alcubierre metric). We then impose that

$$\begin{aligned}\partial_t \sigma_{ij} &= 
\beta^k D_k \sigma_{ij} + \sigma_{kj} \partial_i \beta^k + \sigma_{ik} \partial_j \beta^k - \kappa \alpha \sigma_{ij}, \\
\partial_t \bar{p} &= 
\beta^i \partial_i \bar{p}
+ \partial_t {\rho}
- \beta^i \partial_i \rho
- \kappa \alpha (\bar{p} - \rho),\end{aligned} \tag{16}$$

where the first terms are the advection of the fields in spacetime and the terms containing $\kappa$ set a timescale related to proper time for the decay of the anisotropic stresses to zero and the pressure to that of a stiff fluid for which $\bar{p} = \rho$. We take the timescale $1/\kappa$ to be of order $[R]$. Evolving the anisotropic and average pressure components, we can at any point reconstruct $S_{ij}$ from their values as defined by Eq. (15)[^4].

This construction assumes that there is some transition after the warp field breakdown that reverts the warp fluid to a perfect fluid with a stiff equation of state and a velocity that matches the normal observers, such that the divergence term in Eq. (13) and the anisotropic stresses decay away. Further investigations are needed to understand the influence of the equation of state of the warp field on the gravitational-wave signal, but it appears that the metric behaviour mostly dominates the signal. However, the chosen equation of state will strongly affect the matter fluxes, which may change the conclusions in Sec. .

The evolution of the energy density $\rho$ that results from this prescription is illustrated in Fig. .

### Numerical setup

The size of the domain is $L=168~[R]$ with $N=224$ cells on the coarsest grid in the direction of travel of the warp ship (the $z$ axis). In the $x$ and $y$ directions, we use the symmetry of the problem to halve the simulation domain so that we only evolve a quarter of the full domain, with appropriate parities at the reflection boundaries. In the nonsymmetric directions, we use Sommerfeld boundary conditions [48]. We employ 6 levels of 2:1 refinement, such that the finest grid has a width of $2.625 [R]$ and the finest grid spacing is $dx\sim 0.0117 [R]$. 

For all runs, the size of the warp ship in code units is set to be $R=1$, and the value that determines the wall thickness $\sigma$ is set to be $8$. The velocity of the warp ship is varied between 0.1 and 0.2. We have found that we can stably evolve higher velocities up to 0.5, but good quality results require very high resolutions, which would be better achieved with a code adapted to the axisymmetry. This work can be viewed as a step towards the study of the physicality of the faster-than-light case, where there are good reasons to suppose that the spacetime should be pathological in some way. By showing that numerical evolutions can be made to work at sub-light speeds, this gives us hope of being able to trace a point of breakdown near light speed.

The waves are extracted at a radius of $14[R]$. This is much smaller than values used in binary extraction, but the system here is very different and so the comparison is not appropriate. In particular, the spacetime is already flat outside the original bubble wall at $R$. The total integrated mass of the matter is also initially of order (minus) $M = \int \rho dV \sim 0.01R$, and not $M\sim R$ as in, say, a neutron star. Since the frequency of the waves is high relative to the grid spacing, we need to extract further in to obtain a good resolution of the frequencies using the adaptive mesh refinement (AMR) hierarchy. We have checked the consistency of the waves at different resolutions, and details of the checks we have done on convergence of the constraints and verification of the matter evolution are given in Appendix .

## Results

### Gravitational waves

A visualisation of the evolution of the gravitational-wave content is shown in Fig. . We plot the extracted Weyl scalar $\Psi_4$ for the main $m=0$ modes in Fig. . The signal comes as a burst, initially having no gravitational wave content, followed by an oscillatory period with a characteristic frequency of order $1/[R]$. Overall, the signal is very distinct from the typical compact binary coalescences observed by gravitational-wave detectors and more similar to events like the collapse of an unstable neutron star or the head-on collision of two black holes [54, 55]. However, since the remnant is not a black hole, there is no characteristic black hole ringdown in the signal, and there is evidence of a longer lower frequency tail, particularly for higher velocities.

Integrating $\Psi_4$, we find that for a warp speed of $v=0.1$, the magnitude of the strain times the radius of extraction is of order $10^{-2} [R]$. Thus, for a 1 km-sized warp ship, the strain of the signal at a distance of 1 Mpc would be $10^{-21}$. However, its frequency ($f\sim 1/[R]$) equates to $f\sim$ 300 kHz, which is outside the range of current ground based detectors. Proposals for higher frequency detectors have been made [56], so in future one may be able to put bounds on the existence of such signals. Depending on the size of the warp bubble, which determines the frequency of the signal, as well as the distance to the source, these signatures may be detected through a coherent search or burst search combining information from multiple gravitational-wave detectors [e.g.,][]Sutton:2009gi,Cornish:2014kda,Klimenko:2015ypf. A more in depth analysis, like the one of [1], would be needed to give accurate bounds.

We note that since the matter and gravitational waves propagate at the same speed, the gravitational waves are never in an exact vacuum. We use the appropriate calculation of the Weyl scalars to account for this, but it means that the two components may continue to interact and that the gravitational waves will not fall off exactly as $1/r$ (although the difference is small over the domain we study). This is specific to the case where the matter propagates at the speed of light, whereas in a more realistic matter model we would expect the matter to be moving slower and the gravitational waves to propagate ahead. This is another point that could be investigated further in future work.

![Figura 4](figures/Psi4.png)

**Figura 4.** Modes of the Newman-Penrose scalar $ _4$ multiplied by the coordinate radius for different values of the warp speed $v$. Given the symmetry of the problem, the m$ 0$ modes are zero, so we only show the modes with $l=2,3,4$. We observe that the signal has a frequency set by the size of the warp bubble $f 1/[R]$, which for a 1 km warp bubble would be of the order $f 300$ kHz.

### Matter fluxes

We measure the matter flux out of a spherical coordinate surface $\partial\Sigma$ with unit coordinate normal vector $s^i$ and coordinate area element $dA$ as

$$F = \int_{\partial\Sigma} \sqrt{\gamma} ~T^i_0 s_i dA \tag{17}$$

where $\gamma$ is the determinant of the spatial metric $\gamma_{ij}$ (see [2] for a derivation and details on practical implementation).
We can also integrate this to find the total energy flux that is emitted up to a time $t$ as

$$\Delta E = \int_0^t F(\tilde{t}) d\tilde{t} ~. \tag{18}$$

A visualisation of the evolution of the matter-energy density $\rho$ is shown in Fig. . In Fig. , we show a comparison of the integrated matter and gravitational-wave fluxes out of the sphere at a coordinate radius of $r=14[R]$ around the warp bubble versus time. We see that whilst the gravitational-wave flux is strictly positive as expected, the matter flux alternates in sign, with waves of positive and negative energy leaving the volume. It appears from the evolution that the ejection of matter is driven by a shell of positive energy forming within the negative energy density shell of the initial bubble and driving it outwards. This is reminiscent of the early works of [3], showing the effect of repulsion and attraction between positive and negative energy matter.

In Fig. , we show a zoom-in of the fluxes and integrated energy loss, which shows that the matter flux results in an overall negative flux out of the spacetime, with the gravitational waves giving a much smaller positive flux. The result is that the final mass of the spacetime volume is more positive (having started at zero). It would be interesting to study whether this is a generic effect, such that spacetimes with NEC-violating matter cannot dynamically settle into a state with a mass below zero. We can see from Fig. that nothing appears to impede the gravitational-wave flux when the net matter flux is instantaneously positive overall, as between times $t-r_{ext}=-1.0$ and $-0.5$ on the second panel of the plot so temporary decreases appear to be permitted.

Since we do not know the type of matter used to construct the warp ship, we do not know whether it would interact (apart from gravitationally) with normal matter as it propagates through the Universe. If it did interact, it may give rise to further signatures (i.e., a multimessenger event). For a 1 km sized warp bubble traveling at $v=0.1$, the magnitude of the energy carried by the matter waves, of order $10^{-2}$ [R] (see Fig. ), would be around 1/100 times the mass-energy of the sun.

The evolution does appear to settle down into a stable remnant, that could be described as a “star” of the warp fluid - it is a configuration of the fluid that appears to balance the gravitational forces and fluid pressures. We would need to evolve for longer and use a larger grid (to avoid boundary reflection effects) to be sure about its stability, but it appears to have settled to at least an approximately steady state in the period simulated.

![Figura 5](figures/FluxPlots.png)

**Figura 5.** A comparison of the integrated matter and gravitational-wave energy fluxes out of sphere at a coordinate radius of $r=14[R]$ around the warp bubble versus time for different $v$. The top panel shows the integrated matter fluxes (i.e., the total energy radiated). The bottom panel shows the integrated gravitational wave fluxes in the 20 mode. The net gravitational-wave flux is always positive, whereas the net matter flux oscillates as waves of positive and negative energy leave the volume. Note that the matter flux is significantly larger in magnitude than that of the gravitational waves.

![Figura 6](figures/FluxPlotsZoom.png)

**Figura 6.** Zoom in on the start and end periods of the integrated energy fluxes in the matter and gravitational waves as in Fig. fig:Energy for the case $v=0.1$. We see that the flux begins in the matter sector, with alternating waves of positive and negative energy. The gravitational-wave flux starts a little later but continues throughout the periods in which the net matter flux is both positive and negative. The second panel shows that the overall matter energy loss is negative (i.e. the energy of matter in the volume increases), whereas the gravitational-wave flux is overall positive as expected but much smaller. The final mass of the spacetime volume once the spacetime settles into a stationary state

## Discussion

In this work, we proposed a formalism for studying warp drive spacetimes dynamically and produced the first fully consistent numerical-relativity waveforms for the collapse of a warp drive bubble. 

We also studied the evolution of the fluxes of matter and gravitational-wave energy from the spacetime, finding that an initial wave of negative energy matter is emitted, followed by alternating positive and negative energy waves. The gravitational-wave flux starts shortly after and is positive throughout, as expected. The end result is a net negative flux of energy, resulting in a higher final mass of the spacetime volume. It would be interesting to explore to what extent this behaviour is generic or depends on the chosen equation of state supporting the warp bubble. To do this, one would want to consistently implement a fluid description with a general rest frame velocity and equation of state, unlike the somewhat ad hoc setup employed here.

This work could be extended in several other directions. Firstly, using a code better adapted to the axisymmetry, one could extend to higher speeds, including those that exceed $v=1.0$, to see if there is a change in behaviour as light speed is approached. One might expect to see some kind of pathology develop, e.g., the formation of elliptic regions that cause the dynamical evolution to fail. Better resolution and longer evolutions would also allow better characterization of the strain signal, particularly the role of the gravitational-wave memory content [57]. 

As discussed above, for a 1km-sized ship, the frequency of the signal $\sim 300$ kHz is much higher than the range probed by existing detectors, so current observations cannot constrain the occurrence of such events. However, the amplitude of the strain signal would be significant for any such event within our galaxy and even beyond - at a distance of 1 Mpc, slightly further than the Andromeda galaxy, the strain amplitude is similar to LIGO detector's peak sensitivity. The signal is therefore potentially within the reach of future detectors targeting higher frequencies [56]. We caution that the waveforms obtained are likely to be highly specific to the model employed, which has several known theoretical problems, as discussed in the Introduction. Further work would be required to understand how generic the signatures are, and properly characterise their detectability.

## Acknowledgements

The crew thanks the creators and actors of the Star Trek universe for their inspiration for this work. We also thank the many people who discussed the project and gave useful feedback and encouragement, especially the 2023 Peyresque workshop attendees and our NR friends at the 2023 ETK meeting in Aveiro. Particular conceptual help was given by Jean Alexandre, Josu Aurrekoetxea, Mark Hannam, Juan Valiente Kroon, Gautam Satischandran, and Miren Radia and Josu Aurrekoetxea provided the gravitational-wave analysis scripts used. The `GRTL` collaboration is warmly acknowledged for the use of their GRChombo code (`www.grchombo.org`) and the development work that supports it.
Katy “I cannae change the laws of physics Captain” Clough thanks the University of Potsdam and the Albert Einstein Institute in Potsdam for hosting her for the final stage of the project and acknowledges current support from an STFC Ernest Rutherford fellowship, project reference ST/V003240/1, and previous support from the European Research Council (ERC) under the European Union’s Horizon 2020 research and innovation programme (grant agreement No 693024). Tim “Captain Jim T." Dietrich thanks Pedro Ferreira for hosting him at the University of Oxford, which allowed this project to make significant progress. TD also acknowledged support from the European Union (ERC, SMArt, 101076369). Views and opinions expressed are those of the authors only and do not necessarily reflect those of the European Union or the European Research Council. Neither the European Union nor the granting authority can be held responsible for them.
Sebastian “Wrath of" Khan thanks Jens Niemeyer for hosting him in Georg August University of Goettingen, where the voyage towards this article first began. 

The simulations presented in this paper used the Glamdring cluster in Astrophysics at Oxford University and DiRAC resources under the projects of dp092 (Testing the limits of General Relativity). This work used the DiRAC Memory Intensive service (Cosma8 and Cosma7) at Durham University, managed by the Institute for Computational Cosmology on behalf of the STFC DiRAC HPC Facility (www.dirac.ac.uk). The DiRAC service at Durham was funded by BEIS, UKRI and STFC capital funding, Durham University and STFC operations grants. This work also used the DiRAC Data Intensive service (DIaL3) at the University of Leicester, managed by the University of Leicester Research Computing Service on behalf of the STFC DiRAC HPC Facility (www.dirac.ac.uk). The DiRAC service at Leicester was funded by BEIS, UKRI and STFC capital funding and STFC operations grants. This work also used the DiRAC Data Intensive service (CSD3) at the University of Cambridge, managed by the University of Cambridge University Information Services on behalf of the STFC DiRAC HPC Facility (www.dirac.ac.uk). The DiRAC component of CSD3 at Cambridge was funded by BEIS, UKRI and STFC capital funding and STFC operations grants. DiRAC is part of the UKRI Digital Research Infrastructure.

![Figura 7](figures/HamConverge.png)

**Figura 7.** The top panel shows the L2 norm of the Hamiltonian constraint violation over time in the central volume over which data is extracted, the second the same for the Momentum constraint violation. These show approximate convergence of the quantities to zero with increasing resolution between 1st and and 3rd order. The final panel shows the reconciliation of the matter-energy fluxes and source term (the exchange of energy with the curvature) as described in the main text. The agreement between the direct measurement of M and its inferred value from the flux and source terms validates that the matter is well resolved in the relevant volume.

## Numerical details, validation and convergence

To validate our simulations, we monitor the violations of the Hamiltonian and momentum constraints which are given by

$$\begin{aligned}\mathcal{H} &:= R + \frac{2}{3}K^2 
- \tilde{A}_{kl}\tilde{A}^{kl}-2\Lambda-16\pi\rho,
\\

\mathcal{M}_i &:= \tilde{\gamma}^{kl}\left(\partial_k \tilde{A}_{li} 
-2\tilde{\Gamma}^m_{l(i}\tilde{A}_{k)m}
-3\tilde{A}_{ik}\frac{\partial_l\chi}{2\chi}\right) \\

& \quad -\frac{2}{3}\partial_iK - 8\pi S_i.\end{aligned} \tag{19}$$

In the continuum limit these two quantities should vanish. 
We check that the initial values converge to zero at the appropriate order, which validates the initial stress energy tensor components $\rho$ and $S_i$. The Hamiltonian constraint is solved exactly to numerical precision, whereas the spatial gradients in the Momentum constraint mean that it should initial converge at 4th order. During the evolution we expect errors to be dominated by the time integration, and give something between 1st and 3rd order, with some of the drop in convergence caused by the approximate way that we zero the constraints outside the volume.

We calculate the L2 norm of the constraints over the coordinate volume for which the matter integrals are evaluated (with its 2D surface also being the surface used for extraction of the gravitational waves), which is at a coordinate radius of $r=14[R]$ from the centre of the grid.
As shown in Fig , the constraint violations remain under control throughout the simulation and converge at a reasonable order.

To verify that the matter is sufficiently resolved within the volume of interest, we also reconcile the matter quantities over time, checking that the net energy flux out of the surface matches the change in the matter energy and any exchange with the curvature (often referred to as a “source”) over time. For this, we follow the approach of [2]. As shown in the last panel of Fig. , the agreement is good throughout the simulation, which gives us confidence in the matter evolution.

[^1]: Recent works that have suggested positive energy warp drive solutions [24, 25, 26] have problems that are discussed in [27].
[^2]: It circumvents theorems about all asymptotically Minkowskian spacetimes being Minkowski [36, 37] by the presence of the negative energy contribution. Note that the spacetime at spatial infinity, where the ADM mass is defined, is causally disconnected from the spacetime of the warp bubble, therefore the true ADM mass should be conserved and remain at zero. When we refer to the mass of the spacetime volume here, after a period of dynamical evolution, we mean a quasi-local analogy obtained by integrating over the surface of a finite volume some distance away from the collapsing bubble, after that volume has reached a stationary state with no net fluxes in or out.
[^3]: For comparison, the Enterprise-E of the Star Trek universe is 685.7 meters in length [41].
[^4]: One might consider trying to naively evolve the equation of state in Eq. (13), but a simple analysis shows that this introduces higher derivative terms to the equation of motion for the momentum density (either 3rd spatial derivatives of the lapse or 3rd-time derivatives of the spatial metric). Given the high chance that such terms will result in an ill-posed evolution system, we do not follow this approach.

## References

1. Soichiro Kuwahara and Kipp Cannon. Development and Application of a Detection System for a Novel Class of Gravitational-Wave Transients. 10 2023.
2. Katy Clough. Continuity equations for general matter: applications in numerical relativity. *Class. Quant. Grav.*, 38 0 (16): 0 167001, 2021. 10.1088/1361-6382/ac10ee.
3. H. Bondi. Negative Mass in General Relativity. *Rev. Mod. Phys.*, 29: 0 423--428, 1957. 10.1103/RevModPhys.29.423.
4. Eric Gourgoulhon. 3+1 formalism and bases of numerical relativity. *arXiv: 0703035*, 2007.
5. Miguel Alcubierre. Introduction to 3+1 Numerical Relativity. International Series of Monographs on Physics. Oxford University Press, Oxford, 2008. ISBN 9780199205677. 10.1093/acprof:oso/9780199205677.001.0001.
6. Thomas Baumgarte and Stuart Shapiro. *Numerical Relativity*. Cambridge University Press, Cambridge, 2010.
7. Thomas W. Baumgarte and Stuart L. Shapiro. Numerical Relativity: Starting from Scratch. Cambridge University Press, 2 2021. ISBN 978-1-108-93344-5, 978-1-108-84411-6, 978-1-108-92825-0. 10.1017/9781108933445.
8. Subrahmanyan Chandrasekhar. The maximum mass of ideal white dwarfs. *Astrophys. J.*, 74: 0 81--82, 1931. 10.1086/143324.
9. Roger Penrose. Gravitational collapse and space-time singularities. *Phys. Rev. Lett.*, 14: 0 57--59, 1965. 10.1103/PhysRevLett.14.57.
10. Kazunori Akiyama et al. First M87 Event Horizon Telescope Results. I. The Shadow of the Supermassive Black Hole. *Astrophys. J. Lett.*, 875: 0 L1, 2019. 10.3847/2041-8213/ab0ec7.
11. B. P. Abbott et al. Observation of Gravitational Waves from a Binary Black Hole Merger. *Phys. Rev. Lett.*, 116 0 (6): 0 061102, 2016. 10.1103/PhysRevLett.116.061102.
12. A. M. Ghez et al. Measuring Distance and Properties of the Milky Way's Central Supermassive Black Hole with Stellar Orbits. *Astrophys. J.*, 689: 0 1044--1062, 2008. 10.1086/592738.
13. Francisco S.N. Lobo. Exotic solutions in General Relativity. 10 2007.
14. Jessica Santiago, Sebastian Schuster, and Matt Visser. Tractor Beams, Pressor Beams and Stressor Beams in General Relativity. *Universe*, 7 0 (8): 0 271, 2021. 10.3390/universe7080271.
15. Miguel Alcubierre. The warp drive: hyper-fast travel within general relativity. *Class. Quant. Grav.*, 11: 0 L73--L77, 1994. 10.1088/0264-9381/11/5/001.
16. Miguel Alcubierre and Francisco S. N. Lobo. Warp Drive Basics. *Fundam. Theor. Phys.*, 189: 0 257--279, 2017. 10.1007/978-3-319-55182-1_11.
17. Allen E. Everett. Warp drive and causality. *Phys. Rev. D*, 53: 0 7365--7368, 1996. 10.1103/PhysRevD.53.7365.
18. William A. Hiscock. Quantum effects in the Alcubierre warp drive space-time. *Class. Quant. Grav.*, 14: 0 L183--L188, 1997. 10.1088/0264-9381/14/11/002.
19. Matt Visser, Bruce Bassett, and Stefano Liberati. Superluminal censorship. *Nucl. Phys. B Proc. Suppl.*, 88: 0 267--270, 2000. 10.1016/S0920-5632(00)00782-9.
20. F. Loup, D. Waite, and Jr. Halerewicz, E. Reduced total energy requirements for a modified Aalcubierre warp drive space-time. 7 2001.
21. Richard K. Obousy and Gerald Cleaver. Warp Drive: A New Approach. *J. Br. Interplanet. Soc.*, 61: 0 364, 2008.
22. Ken D. Olum. Superluminal travel requires negative energies. *Phys. Rev. Lett.*, 81: 0 3567--3570, 1998. 10.1103/PhysRevLett.81.3567.
23. Francisco S. N. Lobo and Matt Visser. Fundamental limitations on 'warp drive' spacetimes. *Class. Quant. Grav.*, 21: 0 5871--5892, 2004. 10.1088/0264-9381/21/24/011.
24. Erik W. Lentz. Breaking the warp barrier: hyper-fast solitons in EinsteinMaxwell-plasma theory. *Class. Quant. Grav.*, 38 0 (7): 0 075015, 2021. 10.1088/1361-6382/abe692.
25. Alexey Bobrick and Gianni Martire. Introducing Physical Warp Drives. *Class. Quant. Grav.*, 38 0 (10): 0 105009, 2021. 10.1088/1361-6382/abdf6e.
26. Shaun D. B. Fell and Lavinia Heisenberg. Positive energy warp drive from hidden geometric structures. *Class. Quant. Grav.*, 38 0 (15): 0 155020, 2021. 10.1088/1361-6382/ac0e47.
27. Jessica Santiago, Sebastian Schuster, and Matt Visser. Generic warp drives violate the null energy condition. *Phys. Rev. D*, 105 0 (6): 0 064038, 2022. 10.1103/PhysRevD.105.064038.
28. Carlos Barcelo and Matt Visser. Twilight for the energy conditions? *Int. J. Mod. Phys. D*, 11: 0 1553--1560, 2002. 10.1142/S0218271802002888.
29. Eleni-Alexandra Kontou and Ko Sanders. Energy conditions in general relativity and quantum field theory. *Class. Quant. Grav.*, 37 0 (19): 0 193001, 2020. 10.1088/1361-6382/ab8fcf.
30. Michael J. Pfenning and L.H. Ford. The Unphysical nature of 'warp drive'. *Class. Quant. Grav.*, 14: 0 1743--1751, 1997. 10.1088/0264-9381/14/7/011.
31. Christopher J. Fewster and Edward Teo. Bounds on negative energy densities in static space-times. *Phys. Rev. D*, 59: 0 104016, 1999. 10.1103/PhysRevD.59.104016.
32. S. Krasnikov. The Quantum inequalities do not forbid space-time shortcuts. *Phys. Rev. D*, 67: 0 104013, 2003. 10.1103/PhysRevD.67.104013.
33. Stefano Finazzi, Stefano Liberati, and Carlos Barcelo. Semiclassical instability of dynamical warp drives. *Phys. Rev. D*, 79: 0 124017, 2009. 10.1103/PhysRevD.79.124017.
34. Miguel Alcubierre. Wormholes, Warp Drives and Energy Conditions, volume 189. Springer, 2017. 10.1007/978-3-319-55182-1.
35. Sebastian Schuster, Jessica Santiago, and Matt Visser. ADM mass in warp drive spacetimes. *Gen. Rel. Grav.*, 55 0 (1): 0 14, 2023. 10.1007/s10714-022-03061-9.
36. Edward Witten. A Simple Proof of the Positive Energy Theorem. *Commun. Math. Phys.*, 80: 0 381, 1981. 10.1007/BF01208277.
37. R. Schon and Shing-Tung Yau. On the Proof of the positive mass conjecture in general relativity. *Commun. Math. Phys.*, 65: 0 45--76, 1979. 10.1007/BF01940959.
38. Karl-Peter Marzlin and Michael P. Kinach. Exactly solvable 2D model for photon propagation in curved space: loss of interference and Bell inequality violation. *Class. Quant. Grav.*, 39 0 (6): 0 065005, 2022. 10.1088/1361-6382/ac4fbb.
39. R. Arnotwitt, S. Deser, and C.W. Misner. Canonical variables for general relativity. *Physical Review*, 117 0 (6): 0 1595--1602, March 1960.
40. James W. York. Kinematics and dynamics of general relativity. In Larry L. Smarr, editor, *Sources of gravitational radiation*, pages 83--126. Cambridge University Press, Cambridge, UK, 1979. ISBN 0-521-22778-X.
41. D. Drexler and M. Clark. *Ships of the Line*. Star Trek. Gallery Books, 2014. ISBN 9781476792675. URL https://books.google.co.uk/books?id=9YN0AwAAQBAJ.
42. Daniela Alic, Carles Bona-Casas, Carles Bona, Luciano Rezzolla, and Carlos Palenzuela. Conformal and covariant formulation of the Z4 system with constraint-violation damping. *Phys.Rev.*, D85: 0 064040, 2012. 10.1103/PhysRevD.85.064040.
43. Carles Bona, Joan Masso, Edward Seidel, and Joan Stela. A New formalism for numerical relativity. *Phys. Rev. Lett.*, 75: 0 600--603, 1995. 10.1103/PhysRevLett.75.600.
44. John G. Baker, Joan Centrella, Dae-Il Choi, Michael Koppitz, and James van Meter. Gravitational wave extraction from an inspiraling configuration of merging black holes. *Phys. Rev. Lett.*, 96: 0 111102, 2006. 10.1103/PhysRevLett.96.111102.
45. Manuela Campanelli, C. O. Lousto, P. Marronetti, and Y. Zlochower. Accurate Evolutions of Orbiting Black-Hole Binaries Without Excision. *Phys. Rev. Lett.*, 96: 0 111101, 2006. 10.1103/PhysRevLett.96.111101.
46. James R. van Meter, John G. Baker, Michael Koppitz, and Dae-Il Choi. How to move a black hole without excision: gauge conditions for the numerical evolution of a moving puncture. *Phys. Rev.*, D73: 0 124011, 2006. 10.1103/PhysRevD.73.124011.
47. Tomas Andrade et al. GRChombo: An adaptable numerical relativity code for fundamental physics. *J. Open Source Softw.*, 6 0 (68): 0 3703, 2021. 10.21105/joss.03703.
48. Miren Radia, Ulrich Sperhake, Amelia Drew, Katy Clough, Pau Figueras, Eugene A. Lim, Justin L. Ripley, Josu C. Aurrekoetxea, Tiago Franca, and Thomas Helfer. Lessons for adaptive mesh refinement in numerical relativity. *Class. Quant. Grav.*, 39 0 (13): 0 135006, 2022. 10.1088/1361-6382/ac6fa9.
49. Katy Clough, Pau Figueras, Hal Finkel, Markus Kunesch, Eugene A. Lim, and Saran Tunyasuvunakool. GRChombo : Numerical Relativity with Adaptive Mesh Refinement. *Class. Quant. Grav.*, 32 0 (24): 0 245011, 2015. 10.1088/0264-9381/32/24/245011. [Class. Quant. Grav.32,24(2015)].
50. Miguel Alcubierre. The Appearance of coordinate shocks in hyperbolic formalisms of general relativity. *Phys. Rev. D*, 55: 0 5981--5991, 1997. 10.1103/PhysRevD.55.5981.
51. Miguel Alcubierre. Hyperbolic slicings of spacetime: singularity avoidance and gauge shocks. *Class. Quant. Grav.*, 20: 0 607--624, 2003. 10.1088/0264-9381/20/4/304.
52. Thomas W. Baumgarte and David Hilditch. Shock-avoiding slicing conditions: Tests and calibrations. *Phys. Rev. D*, 106 0 (4): 0 044014, 2022. 10.1103/PhysRevD.106.044014.
53. John G. Baker, Manuela Campanelli, and Carlos O. Lousto. The Lazarus project: A Pragmatic approach to binary black hole evolutions. *Phys. Rev. D*, 65: 0 044001, 2002. 10.1103/PhysRevD.65.044001.
54. Bruno Giacomazzo, Luciano Rezzolla, and Nikolaos Stergioulas. Collapse of differentially rotating neutron stars and cosmic censorship. *Phys.Rev.*, D84: 0 024022, 2011. 10.1103/PhysRevD.84.024022.
55. Ulrich Sperhake, Bernard J. Kelly, Pablo Laguna, Kenneth L. Smith, and Erik Schnetter. Black hole head-on collisions and gravitational waves with fixed mesh-refinement and dynamic singularity excision. *Phys. Rev. D*, 71: 0 124042, 2005. 10.1103/PhysRevD.71.124042.
56. Nancy Aggarwal et al. Challenges and opportunities of gravitational-wave searches at MHz to GHz frequencies. *Living Rev. Rel.*, 24 0 (1): 0 4, 2021. 10.1007/s41114-021-00032-5.
57. Keefe Mitman et al. A Review of Gravitational Memory and BMS Frame Fixing in Numerical Relativity. 5 2024.
