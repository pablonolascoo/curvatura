# Constant Velocity Physical Warp Drive Solution

**Jared Fuchs**$^{\dagger\,1,2}$, **Christopher Helmerich**$^{1,2}$, **Alexey Bobrick**$^{2,3}$, **Luke Sellers**$^{2,4}$, **Brandon Melcher**$^{2}$ & **Gianni Martire**$^{2}$

> Original source: https://arxiv.org/abs/2405.02709
> Journal: Classical and Quantum Gravity 41, 095013 (2024)
> License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). © The authors.

$^{1}$ The University of Alabama in Huntsville, 301 Sparkman Drive, Huntsville, Alabama, 35899, U.S.
$^{2}$ Advanced Propulsion Laboratory at Applied Physics, 477 Madison Avenue, New York, 10022, U.S.
$^{3}$ Technion - Israel Institute of Technology, Physics Department, Haifa 32000, Israel
$^{4}$ UCLA Department of Physics & Astronomy, 475 Portola Plaza, Los Angeles, CA 90095, U.S.

E-mail: $^\dagger$ jef0011@uah.edu & jared@appliedphysics.org

August 2023

## Abstract

Warp drives are exotic solutions of general relativity that offer novel means of transportation. In this study, we present a solution for a constant-velocity subluminal warp drive that satisfies all of the energy conditions. The solution involves combining a stable matter shell with a shift vector distribution that closely matches well-known warp drive solutions such as the Alcubierre metric. We generate the spacetime metric numerically, evaluate the energy conditions, and confirm that the shift vector distribution cannot be reduced to a coordinate transformation. This study demonstrates that classic warp drive spacetimes can be made to satisfy the energy conditions by adding a regular matter shell with a positive ADM mass.

## 1. Introduction

Warp drive spacetimes, first introduced by Alcubierre [1] and later by others [19, 14], offer several unique transportation properties for timelike observers. These properties include the possibility of accelerating through geodesic motion, moving superluminally, or being in regions of modified spacetime, all relative to external inertially moving timelike observers. All of these classic warp drive spacetimes violate some if not all of the energy conditions [10, 15], and therefore, their construction has been largely considered to be unfeasible. However, recent papers [13, 4, 9] have suggested that 'physical warp drives' that satisfy some or all of the energy conditions could possibly be constructed, reigniting interest in the subject.

Due to the complexity of the Einstein equations, progress toward finding physical warp drive solutions through purely analytical means has been slow. In particular, factors that increase the complexity of these equations considerably are non-unit lapse functions and non-flat spatial metrics, both of which have been absent from most previous warp drive solutions and both of which have been argued to be necessary for satisfying the energy conditions [4]. To address this challenge, the computational toolkit, *Warp Factory* [11], was developed to provide numerical methods for exploring warp drive spacetimes more comprehensively. Using this new-found flexibility afforded by *Warp Factory*, we present here a new subluminal constant-velocity warp drive solution with a non-unit lapse and non-flat spatial metric that satisfies all of the energy conditions.

### 1.1. Key Features of a Warp Drive Spacetime

A detailed discussion on the properties of warp drive spacetimes may be found in [11], here we summarize these key features for clarity. Warp drive spacetimes may be viewed as modifications of a background globally hyperbolic and asymptotically-flat spacetime, which contains a generally non-geodesic trajectory $\mathcal{C}_{\rm background}$ connecting two arbitrary points A and B. A warp drive spacetime modifies this background spacetime such that the following is true:

1. *Geodesic transport:* The generally non-geodesic trajectory $\mathcal{C}_{\rm background}$ in the background spacetime maps to a geodesic trajectory $\mathcal{C}_{\rm background} \rightarrow \mathcal{C}_{\rm warp}$ in the new warp drive spacetime. In other words, warp drive spacetimes enable passengers to travel between points A and B along a geodesic trajectory $\mathcal{C}_{\rm warp}$. This means the passengers inside the warp drive do not experience local acceleration while being transported[^1]. For a non-trivial solution, the original trajectory $\mathcal{C}_{\rm background}$ should not be a geodesic, i.e. the passengers should not 'already be going' from point A to point B. An example of a non-trivial solution is a passenger in a static background spacetime that is initially at rest at point A (relative to the local frame of rest), is transported to point B, and is then, again, at rest relative to point B. In addition, the warp modification should minimally affect the proper distances between A and B measured along the path, as defined originally in the background spacetime.

2. *Empty passenger region:* The warp drive spacetime has a compact vacuum ($T^{\mu\nu} = 0$)[^2] passenger region that is free from tidal forces and encloses the passenger trajectory $\mathcal{C}_{\rm warp}$.

3. *A spatially bounded, comoving bubble:* The warp drive spacetime has a compact non-vacuum region ($T^{\mu\nu} \neq 0$) that encloses the passenger trajectory $\mathcal{C}_{\rm warp}$ on every spacelike slice. This means the stress-energy distribution required for the geodesic transport does not extend to infinity[^3] and moves along with the transported observers. The requirement of moving with passengers distinguishes warp drive solutions from Krasnikov tubes [8], for example.

### 1.2. Designing Warp Drive Spacetimes

The transportation element of warp drives is about designing timelike curves for passengers to travel between points A and B in spacetime. In this paper, we will go about developing a warp solution in the following steps:

1. Start with a Minkowski background.
2. Define two points A and B in spacetime.
3. Define the starting and end conditions for the passengers that will travel between A and B. For example, the passengers might begin at rest at point A and then end at rest at point B. Such starting conditions can be defined w.r.t to an outside observer situated in a Minkowski space.
4. Define a curve between points A and B that the warp drive and passengers will travel along.
5. Construct a metric solution that will move passengers within the boundary conditions of (iii) along geodesics matched to the curve in (iv). There are multiple possible metrics that enable these specific geodesics, but only one is needed.

Generally speaking, there are many ways that this can be accomplished. In a 3+1 formalism, the metric is given by:

$$
ds^2 = -\alpha^2 dt^2 + \gamma_{ij} (dx^i + \beta^i dt)(dx^j + \beta^j dt), \tag{1}
$$

where $\alpha$ is the lapse function, $\beta^i$ is the shift vector and $\gamma_{ij}$ is the spatial metric. We can consider the general geodesic equations in a 3+1 formalism parameterized by the coordinate time [3] as:

$$
\begin{aligned}
&\frac{d x^i}{d t}=\gamma^{i j} \frac{u_j}{u^0}-\beta^i \\
&\frac{d u_i}{d t}=-\alpha u^0 \partial_i \alpha+u_k \partial_i \beta^k-\frac{u_j u_k}{2 u^0} \partial_i \gamma^{j k} \\
&u^0=\left(\gamma^{j k} u_j u_k+\epsilon\right)^{1 / 2} / \alpha
\end{aligned}
\tag{2}
$$

where $u^\mu = dx^\mu/d\tau$ and $\epsilon =$ 1 or 0 for timelike or null geodesics. The use of $dx^i/dt$ and $du_i/dt$ are coordinate dependent, but within a fully defined spacetime and coordinate system, these values take on a specific meaning. To illustrate this let us consider the Alcubierre metric [1] given by:

$$
ds^2 = -d t^2+\left(d x-v_s f\left(r_s\right) d t\right)^2+d y^2+d z^2 \tag{3}
$$

where $r_s= \sqrt{(x-x_s(t))^2 + y^2 + z^2}$. $x_s(t)$ and $v_s(t)$ are the center position and speed of the warp drive, respectively, and $f(r_s)$ is a shape function that defines the warp bubble extent from the center. Alcubierre's solution is a shift vector addition to an otherwise Minkowski spacetime. Thus, it is clear that all the characteristic warp drive features of this spacetime are sourced purely by the shift vector. We can understand this from a different perspective, using the steps and geodesic equations (2) from above. Inside the passenger volume region (defined as $r_s < R$) the spacetime is constrained to be flat, meaning that $\partial_i g_{\mu\nu} = 0$ and hence $du_i/dt = 0$. The passenger geodesic motion in the coordinate system within that region is:

$$
\frac{dx^i}{dt} = v_s = \delta^{ij}\frac{u_j}{u^0} - \beta^i \tag{4}
$$

As seen from the equation above, the geodesic transport of passengers depends on their $u_i$ at the beginning and end of the transport. Alcubierre's solution allows for acceleration using a time-varying $v_s(t)$. If we consider the starting condition where observers are initially at rest ($u^i = u_i = 0$) at some point and then imagine a warp bubble forming around the passengers with the same constraints ($du_i/dt = 0$ for $r_s < R$), then $u_i(t) = 0$ at any time $t$ and the transportation of passengers within the bubble in this scenario is given by:

$$
\frac{dx^i}{dt} = v_s(t) = -\beta^i(t) \tag{5}
$$

In this context, we can consider Alcubierre's warp drive solution as capable of transporting observers initially at rest with respect to an external stationary observer and up to a relative velocity of $v_s$, all accomplished using a localized shift vector in the spacetime with a flat interior region. This example of warp travel is illustrated in Figure 1.

![Figure 1. Example of an Alcubierre warp trajectory with three phases of flight: (i) Passenger enters the warp bubble at rest w.r.t to the reference observer at point A. The passenger will not have any coordinate velocity compared to the reference observer (dx^i/dt = u_i = 0). (ii) Warp bubble begins its travel by accelerating up to a constant velocity. The passenger inside is geodesically transported along up to the coordinate velocity of the warp drive, but still with zero velocity as measured in its proper time (dx^i/dt = v_warp). (iii) Warp bubble decelerates to a stop at point B at rest w.r.t to the reference observer and the passenger exits the drive.](figures/warp_example_v3a.png)

**Figure 1.** Example of an Alcubierre warp trajectory with three phases of flight:
*(i)* Passenger enters the warp bubble at rest w.r.t to the reference observer at point A. The passenger will not have any coordinate velocity compared to the reference observer ($dx^i/dt = u_i = 0$)
*(ii)* Warp bubble begins its travel by accelerating up to a constant velocity. The passenger inside is geodesically transported along up to the coordinate velocity of the warp drive, but still with zero velocity as measured in its proper time ($dx^i/dt = v_{warp}$).
*(iii)* Warp bubble decelerates to a stop at point B at rest w.r.t to the reference observer and the passenger exits the drive.

In this paper, we will focus on analyzing the constant velocity phase of warp flight. This constant velocity focus presents some challenges, as without acceleration, the boundary conditions of passengers entering the drive are less interesting in the simple comoving case. For example, if the warp drive is always at a constant velocity with its passengers having always existed comoving inside the warp drive, then no shift vector is needed since the passengers $u_i/u^0 = v_s$ by definition. Bobrick and Martire discuss this example of a constant velocity case as the basis of a physical warp solution in [4], which results in a regular matter shell. In the Alcubierre example, we can gain an important context for its constant velocity phase when connected to a prior accelerating phase where we define how passengers enter the drive. If the drive undergoes acceleration with a condition of $du_i/dt = 0$, then having a shift vector during the constant velocity phase is required as the passengers prior to this point had $u_i/u^0 < v_s$ and only a shift vector can provide the required $dx^i/dt$ under the curvature constraints applied in the passenger volume.

Almost all of the warp solutions proposed in the literature are essentially variations of Alcubierre's solution and rely on the shift vector to provide the transportation of passengers in the same sense as discussed here. Van Den Broeck's [19] addition of a spatial term is only used to make more efficient use of energy density by volume expansion, but the shift still plays the same role in driving transportation as in the Alcubierre solution, as the spatial term is flat in the passenger volume[^4]. Lentz [13, 12], Fell and Heisenberg [9] and the more general Natario class [14] warp metrics all use several shift vector components but follow in essence the same dynamics as described here. In the spherical symmetric metric [4], no shift vector is used, but again, this is a solution of constant velocity, and shift vector addition could be required when expanding it to a more general accelerating solution.

While shift vectors have been used extensively in the literature, a shift vector is not the only ingredient we can use to build warp drives. Spatial gradients in the lapse and metric spatial terms can affect $du_i/dt$ and then $dx^i/dt$ but require careful management of their spatial derivatives to avoid energy or tidal forces existing inside the passenger volume. The use of a shift is, in many ways, the easiest method to add geodesic transportation as it directly provides a $dx^i/dt$ term to observers based on its magnitude alone. In this work, we will focus on a warp solution that uses a shift vector to obtain the same warp drive properties as those of the Alcubierre solution but in a manner that can maintain physicality.

### 1.3. The Problem of Physicality

The condition of a physical warp drive is discussed in detail in [4] and our recent paper [11], but in essence, the core requirement is to satisfy the energy conditions. The Natario-class of solutions (defined by shift vectors with unit lapse $\alpha=1$ and flat spatial metric $\gamma_{ij}=\delta_{ij}$) has been shown to always violate the energy conditions [15]. One possible reason for this violation is that the metrics as constructed lack the gravitational effect of regular matter. The asymptotic gravitational field produced by a gravitating spherically symmetric object is given by the Schwarzchild metric, which has an asymptotic $1/r$ dependency in the lapse and spatial terms in Schwarzchild coordinates at infinity. For general warp metrics with a *compact support region*, meaning a metric whose components are bounded within some finite region that transitions to Minkowski space faster than 1/r, behaves in ways different from regular matter. This can be expressed in another way using the definition of ADM mass [5], which is a quantity describing the concept of mass as seen in faraway regions. Alcubierre metric and similar solutions have $M_{ADM} = 0$, as opposed to Schwarzschild metric, which for an equivalent energy density magnitude would have $M_{ADM} > 0$. However, even if the metric has non-zero ADM mass, energy condition violations can easily occur. This issue is demonstrated in the recent work of Schuster et al. in the transported Schwarzschild Drive [16]. Further still, even if the solution asymptotically approaches that of a positive matter spacetime with a positive ADM mass, in the non-vacuum warp bubble additional constraints must be applied. As a rule of thumb, the Eulerian momentum flux and pressures should be less than the energy density to satisfy the energy conditions [11]. Finally, from [4] subluminal motion is likely another important requirement for the metric to be physical. In summary, the likely key ingredients to a physical warp drive solution can be simply stated as:

1. The asymptotically flat spacetime should have a positive ADM mass.
2. Generally, much larger positive energy density than both pressure and momentum flux in the non-vacuum warp bubble, as measured by Eulerian observers.
3. Subluminal speeds

These physical ingredients will be the guiding focus of the solution constructed in this paper.

### 1.4. Paper Structure

The paper is structured by first introducing the approach to building a numerical model of a warp drive in Section 2. Then, in Sections 3 - 4, we develop the solutions for a matter shell and its transformation to a Warp Shell through the addition of a shift vector. In Section 5 we discuss the implications of this solution and compare it to prior warp metrics. Finally, we conclude and remark on future steps in Section 6.

## 2. Methods

To overcome the issues encountered by warp solutions in the past, we will use a new approach to constructing warp solutions that maintain a Schwarzschild vacuum solution at large distances with a compact stress-energy tensor. This is accomplished by adding a shift vector distribution on top of a regular shell of matter. The added shift vector is kept below a threshold that causes energy condition violation from the added momentum flux that accompanies its addition. Adding a shift vector will have a similar effect on passenger transport to that in the Alcubierre drive without any energy condition violations.

### 2.1. Building the Bubble

To find a physical solution, we utilize a moving matter shell as the foundation metric for our warp drive. This solution features a flat interior with an asymptotically-flat Schwarzchild solution outside the shell. The shell solution will be constructed in comoving coordinates in which the metric tensor does not depend on time. In this section, we provide a top-level summary of the process, while the details are found in the next section.

First, we need to consider what warp solutions look like in a comoving frame. Since we plan to add a single shift vector to a shell, we look at the Alcubierre solution in a comoving frame to see the form of the shift vector we want to add. To transform Alcubierre's solution to the stationary frame of an external comoving timelike observer, we can use a Lorentz transformation shown in Appendix B as determined for an observer at spatial infinity. It should be noted that this transformation limits us to a subluminal regime, but that is a natural restriction for any external comoving timelike observer and is the regime that is most likely to lead to physical solutions. Performing the Lorentz transformation to the Alcubierre metric results in a shift vector that is zero at $r_s \gg R$ and a non-zero shift vector inside the passenger volume, as shown in Figure 2.

![Figure 2. Example of an Alcubierre solution transformed to a comoving frame using a Lorentz transformation. The static (blue) is the metric for the form defined by Alcubierre in [1]. The comoving (dotted red) is the inverse Lorentz transformation applied to the static solution. Note that the shift vector remains the same but changes occur for the spatial and lapse terms. These changes will be superseded by the matter shell terms when building the physical solution in this paper.](figures/LorentzAlcubierre.png)

**Figure 2.** Example of an Alcubierre solution transformed to a comoving frame using a Lorentz transformation. The static (blue) is the metric for the form defined by Alcubierre in [1]. The comoving (dotted red) is the inverse Lorentz transformation applied to the static solution. Note that the shift vector remains the same but changes occur for the spatial and lapse terms. These changes will be superseded by the matter shell terms when building the physical solution in this paper.

With the transformed Alcubierre solution above, we can now compare this to the same setup for a regular matter shell, which is typically defined in a comoving frame, and see that the warp effect addition can simply be expressed as adding shift vector to the shell metric. This added shift vector $\beta_i$ is applied inside the interior of the shell, where the matter exists to manage the non-vacuum physicality constraints:

$$
g_{warp shell} = g_{shell}+ \delta g_{warp} \tag{6}
$$

where $\delta g_{warp}$ is a metric only containing a shift-vector component along a single direction:

$$
\delta g_{warp} = \begin{pmatrix} 0 & \beta_1 & 0 & 0 \\
\beta_1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \end{pmatrix} \tag{7}
$$

The details for the shell and its warp modification are described in Sections 3 and 4.

As we did for the Alcubierre metric we can return to the geodesic equations (2) to describe how this solution would impact passengers. Although we do not model the acceleration phase here, it may be considered similar to the Alcubierre case. Specifically, the passenger region of this shell interior in constant velocity case will need to be flat, so we can again assume that $du_i/dt = 0$. We will also let $u_i = 0$, just as we did for the case of Alcubierre metric, to consider possible solutions connected to some prior acceleration phase which maintained $du_i/dt = 0$. However, this time, the shell solution will not have Minkowski spatial terms and thus the coordinate motion is now given by:

$$
\frac{d x^i}{d t}= - \beta^i = - \gamma^{i j}\beta_j \tag{8}
$$

Lastly, a question occasionally discussed in warp theory is the nature of the passenger transport w.r.t to the bubble motion, especially as the shift vector decreases to zero at the boundary. In the case of a constant velocity warp drive, where the metric is not changing in the comoving frame, the bubble matter itself will always by definition "move" aligned with the passenger volume. This is a consequence of the fact that the bubble itself is a generating function for the shift vector, determined by the metric through the Einstein field equation. This is true for all constant velocity warp solutions.

### 2.2. Numerical Methods

In this section, we present a summary of our numerical method. We perform numerical analysis using the Warp Factory toolkit presented in detail in [11]. Throughout this paper, we will adopt the 3+1 formalism and always report the Eulerian stress-energy tensor and its components (pressure, momentum flux, and energy density) using the methods from Section 3 in [11]. In Warp Factory, the frame transformation is done on the metric tensor locally at each point using a tetrad corresponding to Eulerian observers, which also transforms the local metric to Minkowski form. This transformation tetrad is applied to the stress-energy tensor, returning the Eulerian-measured stress-energy tensor. The Eulerian observer in this frame is defined in a standard way as:

$$
n_{\mu} = (1, 0, 0, 0) \tag{9}
$$

The observation of energy density $\rho$, momentum flow $p_i$, isotropic pressure $P_i$ and stress tensor $\sigma_{ij}$ from the Eulerian tensor $T^{\hat{\mu}\hat{\nu}}$ by the Eulerain observer at any location is:

$$
\begin{gathered}
\rho = T^{\hat{0}\hat{0}} \\
p_i = T^{\hat{0}\hat{i}} \\
P_i = T^{\hat{i}\hat{i}} \\
\sigma_{ij} = T^{\hat{i}\hat{j}}
\end{gathered}
\tag{10}
$$

The process for defining and evaluating the energy conditions, which is described in detail in Section 3 of [11], is shown here for clarity. The Null Energy Condition (NEC) is given by the contraction of null observers with the stress-energy tensor at all points of the spacetime ($X$):

$$
\Xi_{NEC}(X) = T_{\hat{\mu}\hat{\nu}}(X) k^{\hat{\mu}} k^{\hat{\nu}} \ge 0 \ \ \forall \ \ k^{\hat{\mu}} \tag{11}
$$

where $k^{\hat{\mu}}$ are null observers. The Weak Energy Condition (WEC) is similar to the NEC but with the contraction of timelike observers at all points of spacetime:

$$
\Xi_{WEC}(X) = T_{\hat{\mu}\hat{\nu}}(X) V^{\hat{\mu}} V^{\hat{\nu}} \ge 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{12}
$$

where $V^{\hat{\mu}}$ are timelike observers. The Strong Energy Condition (SEC) is also found using timelike observers contracted with the stress-energy tensor:

$$
\Xi_{SEC}(X) = \left(T_{\hat{\mu}\hat{\nu}}(X) - \frac{1}{2} T(X) \eta_{\hat{\mu}\hat{\nu}} \right)V^{\hat{\mu}} V^{\hat{\nu}} \ge 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{13}
$$

Finally, the Dominant Energy Condition (DEC) is given by contracting the stress-energy tensor in the mixed form using the timelike observers:

$$
\Upsilon^{\hat{\mu}}(X) = -T^{\hat{\mu}}_{\ \ \hat{\nu}}(X) V^{\hat{\nu}} \tag{14}
$$

where $\Upsilon^{\hat{\mu}}\left(X\right)$ must be future pointing, meaning $\Upsilon^{\hat{\mu}}$ is either timelike or null satisfying[^5]:

$$
\xi_D(X) = \eta_{\hat{\mu}\hat{\nu}} \Upsilon^{\hat{\mu}}(X) \Upsilon^{\hat{\nu}}(X) \le 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{15}
$$

The observer vector field is sampled with a spatial orientation density of 100 samples and for timelike observers and an additional velocity magnitude density of 10 samples (see [11] for a detailed discussion of this method).

## 3. Shell Metric

The base for the warp solution is a stable matter shell. We start by constructing this shell in a comoving frame in Schwarzschild coordinates.

### 3.1. Metric Definition

The shell solution is built starting from a general static, spherically symmetric metric, which has the form of [6]:

$$
ds^2 = -e^{2a}dt^2 + e^{2b}dr^2 + d\Omega^2 \tag{16}
$$

The functions of $a$ and $b$ can be solved using the field equation with a known stress-energy tensor. For a simple solution based on the stress-energy tensor for an isotropic fluid, this is a straightforward process where the stress-energy tensor components in the Eulerian frame are given as:

$$
T^{iso}_{\hat{\mu}\hat{\nu}} = \textrm{diag}(\rho,P,P,P) \tag{17}
$$

However, for a stable shell the pressures $P$ can not be assumed as isotropic since the interior radius must withstand the gravity inward pressure, resulting in non-uniform pressure terms along the $\theta$ and $\phi$ directions, akin to hoop stress in a cylinder. With non-isotropic pressure, the solution takes the form:

$$
T^{shell}_{\hat{\mu}\hat{\nu}} = \textrm{diag}(\rho,P_1,P_2,P_3) \tag{18}
$$

To solve for the non-isotropic shell solution, we will take an iterative approach to find $a$ and $b$ as modifications from the isotropic solution by changing the assumed pressure and density used to determine $a$ and $b$ in the isotropic case. A short summary of the process will be as follows:

1. Start with an initial guess solution for the shell metric assuming a constant density $\rho^\prime$ between the inner radius $R_1$ and the outer radius $R_2$.
2. Solve for the initial guess pressure profile $P^\prime(r)$ by assuming the pressure in the shell is isotropic and zero at $r = R_2$ using the Tolman-Oppenheimer-Volkoff (TOV) equation. After solving the differential equation with the single boundary condition at $r = R_2$, we are left with a constant pressure inside, this pressure is set to zero for $r < R_1$ to enforce a vacuum interior.
3. The constant density assumption creates sharp boundaries at $R_1$ and $R_2$ and the isotropic pressure assumption is not valid for the $R_1$ boundary to maintain a stable shell. To address this issue, we soften the boundary using radial smoothing applied to $\rho^{\prime}$ and $P^{\prime}$ using an $f_{smooth}$ function.
4. The smoothed $\tilde{\rho}$ and $\tilde{P}$ are then used to solve for the terms of $a$ and $b$ which build the actual metric. Solving the stress-energy tensor using the Einstein field equations then provides the true $\rho$ and $P_i$ that correspond to the metric obtained in this step.
5. Finally, the smoothing function for pressure and density is iterated upon in steps (iii) and (iv) until we find a metric that satisfies the energy conditions at the boundaries.

The process flow for constructing the metric solution using the process described above is shown in Figure 3.

![Figure 3. Metric creation method where trial solutions are used and then modified to construct a physical shell solution. The process starts with density on the left and then generates a solution on the right.](figures/ShellConstructionDiagram.png)

**Figure 3.** Metric creation method where trial solutions are used and then modified to construct a physical shell solution. The process starts with density on the left and then generates a solution on the right.

The detailed version of the process outlined above is as follows. The starting assumption of the density profile $\rho^\prime$ is that of a spherical shell with an inner radius of $R_1$ and outer radius of $R_2$ with a constant density and total mass $M$. This defines the density as:

$$
\rho^\prime(r) =
\begin{cases}
 0 & 0 \leq r \leq R_1 \\
 \frac{3}{4\pi}\frac{M}{R_2^3-R_1^3} & R_1 \leq r \leq R_2 \\
 0 & R_2 \leq r < \infty
\end{cases}
\tag{19}
$$

and the associated cumulative mass profile $m^\prime(r)$ is just the integration of the density below a given radius $r$, which results in:

$$
m^\prime(r) = \int_0^r 4 \pi r^2 \rho^\prime(r) dr =
\begin{cases}
 0 & 0 \leq r \leq R_1 \\
M\left(\frac{r^3-R_1^3}{R_2^3-R_1^3}\right) & R_1 \leq r \leq R_2 \\
 M & R_2 \leq r < \infty
\end{cases}
\tag{20}
$$

From the density and cumulative mass definitions, we can numerically solve the TOV equation for $P^\prime$ when $R_1<r<R_2$ with a boundary of zero pressure at $r = R_2$ and enforce that $P^\prime = 0$ for $r < R_1$:

$$
\frac{dP^\prime}{dr} =
\begin{cases}
 0 & 0 \leq r < R_1 \\
-G\left(\rho^\prime/c^2+P^\prime/c^4\right)\left(m^\prime/r^2+4\pi r P^\prime/c^2\right)\left(1-\frac{2Gm^\prime}{c^2 r}\right)^{-1} & R_1 < r \leq R_2 \\
0 & R_2 \leq r < \infty
\end{cases}
\tag{21}
$$

This initial solution will have issues at $R_1$ and $R_2$ due to the discontinuity of the density and pressure, this problem is alleviated by applying a numerical smoothing to both $\rho^{\prime}$ and $P^{\prime}$:

$$
\begin{aligned}
&\tilde{\rho} = f_{smooth}(\rho^\prime) \\
&\tilde{P} = f_{smooth}(P^\prime)
\end{aligned}
\tag{22}
$$

The smoothing function applied uses a moving average, which is a lowpass filter with filter coefficients equal to the reciprocal of the span of the average[^6]. The smoothing itself will fix the discontinuity by having finite values of derivatives at the boundaries while maintaining a physical solution. Selecting the smoothing function coefficients is found iteratively until the solution has no violations of the Null, Weak, Dominant, and Strong energy conditions. Once the smoothing is applied, we must recompute the new mass profile as before with the new density $\tilde{\rho}(r)$:

$$
m(r) = \int_0^r 4 \pi r^2 \tilde{\rho}(r) dr \tag{23}
$$

The smoothed values of pressure and density can now be used to solve the metric terms of $a$ and $b$. The mass profile directly determines $b$ which provides $e^{2b}$ as a simple extension of the Schwarzschild solution where $M = m$ [6, Section 5.8, Eq. 5.143]:

$$
e^{2b} = \left(1 - \frac{2Gm}{c^2 r} \right)^{-1} \tag{24}
$$

The second term of $e^{2a}$ is found by solving for $a$ [6, Section 5.8, Eq. 5.152]:

$$
\frac{d a}{dr} = G\left(\frac{m}{c^2 r^2} +\frac{4\pi r}{c^4} \tilde{P}\right)\left(1-\frac{2Gm}{c^2 r}\right)^{-1} \tag{25}
$$

This equation is integrated using the condition that at $r \gg R_2$ the boundary is set by $e^{2a} = e^{-2b}$, which corresponds to a Schwarzchild solution in the vacuum region. The span, or window, $s$ of the smoothing function is selected differently between density and pressure, where we have found that a ratio between the span of density and pressure $s_\rho / s_P \approx 1.72$ works[^7]. The moving average smoothing is applied four times, with the same span and ratios, to the density and pressure for the final solution. For a shell with parameters: $R_1 = 10$ m, $R_2 = 20$ m, $M = 4.49\times 10^{27}$ kg ($2.365$ Jupiter masses)[^8] the pressure and density before and after smoothing are shown in Figure 4. The process so far provides a solution for the metric in spherical coordinates. The last step is to transform this solution to pseudo-Cartesian coordinates, which are convenient for defining the numerical grid, by changing the coordinates and the coordinate differentials using the standard spherical to Cartesian relations. When doing this numerically, the radial solutions for $e^{2a}$ and $e^{2b}$ are interpolated to the Cartesian grid points using Legendre polynomials. The metric, which is built from these parameters, is plotted in Figure 5.

![Figure 4. Density and pressure profiles before and after smoothing for constructing the Shell metric.](figures/Shell_Smoothed_Values.png)

**Figure 4.** Density and pressure profiles before and after smoothing for constructing the Shell metric.

![Figure 5. Shell and Schwarzschild metric components for a slice along the y-axis. Only the non-Minkowski components for this slice are shown. In g_22 the vertical dashed line is where r = r_s for the reference Schwarzschild metric, when the sign flips for the spatial parts.](figures/Shell_Metric.png)

**Figure 5.** Shell and Schwarzschild metric components for a slice along the y-axis. Only the non-Minkowski components for this slice are shown. In $g_{22}$ the vertical dashed line is where $r = r_s$ for the reference Schwarzschild metric, when the sign flips for the spatial parts.

![Figure 6. Shell stress-energy components for a slice along the y-axis. Only the non-zero components are shown for this slice. The smoothed density and pressure lines are as computed from Eq. (22). Note that the energy density is scaled by a factor of c^2.](figures/Shell_Energy.png)

**Figure 6.** Shell stress-energy components for a slice along the y-axis. Only the non-zero components are shown for this slice. The $\tilde{\rho}$ and $\tilde{P}$ lines are the smoothed density and pressure as computed from Eq. (22). Note that the energy density is scaled by a factor of c$^2$.

### 3.2. Stress-Energy Tensor

The resulting stress-energy terms, as measured by Eulerian observers, are plotted in Figure 6. Along each of the principal coordinate directions, the input pressure $\tilde{P}$ used to solve for $a$ from Eq. (25) is equal to the calculated stress-energy pressure $P$ along that direction since it is aligned with the radial direction. The pressures along the x- and z- directions are equal and differ from the y-pressure, with a large spike on the inner bound of the shell. The choice to smooth the pressure and density is made purposely to find a solution with non-isotropic pressures, which is modified from the isotropic with a smoothing filter. For a static shell, the inner boundary at $R_1$ requires a difference in pressure between the radial pressures and the angular pressure to ensure the shell is stable from gravitational collapse. This manifests as a kind of hoop stress around the inner radius of the shell. It is also important that these pressures are all lower in magnitude than the value of the energy density at that point to ensure that the shell is physical. For realistic materials that may have a limited range of pressures possible, this requirement can always be satisfied by making the shell large and modifying the density profile, hence, reducing the gravitational forces. The physicality of the solution is demonstrated by checking the energy conditions using the Warp Factory Toolkit [11], shown in Figure 7. No energy condition violations exist beyond the numerical precision limits that exist at $10^{34}$ in this setup (see Appendix A for a detailed discussion on errors and numerical limitations).

![Figure 7. Shell energy conditions for a slice along the y-axis. Negative values represent violations of the condition. No negative values are found. Units are in [j/m^3]](figures/Shell_Violation.png)

**Figure 7.** Shell energy conditions for a slice along the y-axis. Negative values represent violations of the condition. No negative values are found. Units are in $[j/m^3]$

## 4. Constant Velocity Warp Shell

As described in the introduction, a warp drive that can enable the transport of different observers can do so using a shift vector inside the passenger volume. Therefore, the task is to add a shift vector field to a shell solution while maintaining the energy conditions.

### 4.1. Metric Definition

From the Shell solution constructed in Section 3, we now modify the interior region of the comoving shell to have a shift vector along the direction of motion, in this case along x. The modification must follow a few constraints to create a sensible warp drive within our definition of warp:

1. The interior region should remain flat, meaning all spatial derivatives of the metric are zero ($\partial_i g_{\mu\nu} = 0$). Such a choice ensures that the passengers will be in a vacuum and experience no tidal forces.
2. The transition region of the shift vector must occur between $R_1$ and $R_2$ and smoothly connect with the exterior solution at $R_2$ where $\beta_i = 0$.

The modification of shift will modify the $g_{01}$ term as:

$$
g^{warp}_{01} = g_{01} - S_{warp}(r)\left(g_{01} + \beta_{warp}\right) \tag{26}
$$

where $S_{warp}$ is a compact sigmoid function defined as:

$$
S_{warp}(r) =
\begin{cases}
1 & r < R_1+R_{b} \\
1-f(r) & R_1+R_{b} < r < R_2 - R_{b} \\
0 & r > R_2-R_{b}
\end{cases}
\tag{27}
$$

and $f(r)$ is given by:

$$
f(r) = \left(\exp\left[(R_2-R_1)\left(\frac{1}{r-R_2}+\frac{1}{r-R_1}\right)\right]+1\right)^{-1} \tag{28}
$$

where $R_b>0$ is a buffer region to ensure the derivatives are interior to the bubble. We construct a matter shell with the same parameters as in Section 3. Varying the values of $\beta_{warp}$, we find that the addition of shift inside the shell is possible for $\beta_{warp} = 0.02$ without any energy condition violation[^9]. The components for this metric are plotted in Figure 8.

![Figure 8. Constant velocity Warp Shell metric components for a slice along the y-axis. Only the non-Minkowski components for this slice are shown. Direction of motion is along +X.](figures/Warp_Metric.png)

**Figure 8.** Constant velocity Warp Shell metric components for a slice along the y-axis. Only the non-Minkowski components for this slice are shown. Direction of motion is along +X.

### 4.2. Physicality

To understand the physicality of this solution, we start by plotting the resulting stress-energy terms in Figure 9. The energy density remains mostly unchanged compared to that of a standard moving shell, but the modification of the shift vector causes a difference in the momentum and pressure values for Eulerean observers. The change in the momentum is most noticeable compared to the shell metric, which had zero momentum density between $R_1$ and $R_2$. This modified solution has both positive and negative momentum density around $r \approx (R_2-R_1)/2$. This is indicative of a circulation pattern forming in the momentum flow of the shell. The same kind of momentum flow structure is also observed for an Alcubierre solution [11]. The energy conditions are evaluated for this metric and are shown in Figure 10. Modification of the shift vector in this fashion has no impact on the violation compared to the normal matter shell solution.

Surf plots of the solution for a slice centered in the $Z$ direction are shown for the metric in Figure 11, energy density in Figure 12, other components of stress-energy in Figure 13, and energy condition evaluations in Figure 14.

![Figure 9. Constant velocity Warp Shell stress-energy components for a slice along the cartesian y-axis. The direction of motion is along +X. Note that the energy density is scaled by a factor of c^2 and the momentum density by a factor of c.](figures/Warp_Energy.png)

**Figure 9.** Constant velocity Warp Shell stress-energy components for a slice along the cartesian y-axis. The direction of motion is along +X. Note that the energy density is scaled by a factor of c$^2$ and the momentum density by a factor of c.

![Figure 10. Constant velocity Warp Shell energy conditions for a slice along the y-axis. The direction of motion is along +X. Negative values represent violations of the condition. No negative values are found.](figures/Warp_Violation.png)

**Figure 10.** Constant velocity Warp Shell energy conditions for a slice along the y-axis. The direction of motion is along +X. Negative values represent violations of the condition. No negative values are found.

### 4.3. Cross-Sections

![Figure 11. Metric for the constant velocity Warp Shell in the comoving frame. The direction of motion is along +X. The cross-section is centered in Z. Only the non-zero cross-sections are shown.](figures/Warp_Metric_Surf.png)

**Figure 11.** Metric for the constant velocity Warp Shell in the comoving frame. The direction of motion is along +X. The cross-section is centered in Z. Only the non-zero cross-sections are shown.

![Figure 12. Energy density for the constant velocity Warp Shell. The direction of motion is along +X. The cross-section along Z is aligned with the bubble center. Units are [J/m^3]](figures/Warp_Energy_Density_Surf.png)

**Figure 12.** Energy density for the constant velocity Warp Shell. The direction of motion is along +X. The cross-section along Z is aligned with the bubble center. Units are $[J/m^3]$

![Figure 13. The stress-energy tensor for the constant velocity Warp Shell in the comoving frame, for Eulerian observers. The energy density is shown in Figure 12. The direction of motion is along +X. The cross-section along Z is aligned with the bubble center. Only the non-zero cross-sections are shown. Units are [J/m^3]](figures/Warp_Energy_Surf.png)

**Figure 13.** The stress-energy tensor for the constant velocity Warp Shell in the comoving frame, for Eulerian observers. The energy density is shown in Figure 12. The direction of motion is along +X. The cross-section along Z is aligned with the bubble center. Only the non-zero cross-sections are shown. Units are $[J/m^3]$

![Figure 14. Energy condition evaluation for the constant velocity Warp Shell. The direction of motion is along +X. The cross-section along Z is aligned with the bubble center. The minimum value across all observers is shown. Positive (blue) and zero (white) are physical and negative (red) is violating. Units are in [J/m^3]](figures/Warp_Violation_Surf.png)

**Figure 14.** Energy condition evaluation for the constant velocity Warp Shell. The direction of motion is along +X. The cross-section along Z is aligned with the bubble center. The minimum value across all observers is shown. Positive (blue) and zero (white) are physical and negative (red) is violating. Units are in $[J/m^3]$

## 5. Discussion

### 5.1. Measuring Shift

The addition of a shift vector to the passenger volume of a shell creates several changes to the solution. To fully differentiate a warp shell from a normal matter shell, an invariant test can be constructed using a comparison of light rays traveling through the bubble, measuring the difference in transit time between two paths of rays as they transit along and against the shift vector direction. Since the metric is already defined in a comoving frame, we simply have to run null geodesics through the center of the shell directed forward and backward along the direction of the shift vector and record the proper time $\delta t$ for each photon to return as measured at the emitting points, ignoring photon interaction with the stress-energy tensor. In Figure 15, a diagram of the test setup is shown for each of the photon paths as they travel through the shell and return to the emitting point. This test configuration is constructed within Warp Factory and the light-ray times are numerically determined. Running this test we find that the Warp Shell (from Section 4) has $\delta t \approx 7.6$ ns and the Matter Shell (from Section 3) has $\delta t = 0$ ns. As expected, a normal shell has an equal transit time between both light rays, whereas the Warp Shell has a difference in transit time depending on the ray's direction through the Warp Shell. This delay is not a unique feature of the Warp Shell in this paper but is also true of other proposed warp drives that utilize a shift vector. Using Warp Factory, we conducted the same numerical experiment for a few of the warp drives discussed in the literature, and all of them have a $\delta t > 0$, shown in Table 1[^10]. This experiment demonstrates a Lense-Thirring effect exists for warp drives with shift vectors, creating a *linear frame dragging*[^11]. Since the photon travel time is a measurable quantity, the shift-vector modification of the shell metric cannot be reduced to a coordinate transformation.

![Figure 15. Diagram of the light-ray test. The emitters, detectors, and mirrors are comoving with the shell of interest. Note that both beams pass through the center, but are offset in the diagram for visual clarity. Emitter-detector B is vertically aligned with the mirrors on the left and emitter-detector A is vertically aligned with the mirrors on the right. Emitter-detectors A and B are equidistant to the center of the shell. The return path of the two light beams can be anywhere outside of the shell. The Warp Shell's warp effect is in the horizontal direction away from B and toward A.](figures/LightRayTest.png)

**Figure 15.** Diagram of the light-ray test. The emitters, detectors, and mirrors are comoving with the shell of interest. Note that both beams pass through the center, but are offset in the diagram for visual clarity. Emitter-detector B is vertically aligned with the mirrors on the left and emitter-detector A is vertically aligned with the mirrors on the right. Emitter-detectors A and B are equidistant to the center of the shell. The return path of the two light beams can be anywhere outside of the shell. The Warp Shell's warp effect is in the horizontal direction away from B and toward A.

**Table 1.** Comparison of time delay between different warp models and the matter shell for $v_{warp} = 0.04$ c.

| Name | Parameters | $\delta t$ [ns] |
|:---:|:---:|:---:|
| **Alcubierre** [1] | $R$ = 15 m | 8.0 |
| **Van Den Broeck** [19] | $R_1$ = 10 m, $R_2$ = 15 m, $\alpha$ = $0.1$ | 9.1 |
| **Modified Time** [4] | $R$ = 15 m, A = 2 | 6.7 |
| **Matter Shell** (Sections 3) | $R_1$ = 10 m, $R_2$ = 20 m, M = $4.49 \times 10^{27}$ kg | 0 |
| **Warp Shell** (Section 4) | $R_1$ = 10 m, $R_2$ = 20 m, M = $4.49\times 10^{27}$ kg | 7.6 |

### 5.2. Positive Energy Density

Whether or not a spacetime satisfies the energy conditions is best understood by the relationships between energy density, pressures, and momentum flux in the Eulerian frame ($T^{\hat{\mu}\hat{\nu}}$) [11] since both the NEC and WEC are just expressions of how the different elements of the stress-energy tensor are perceived by different observers. In the Eulerian frame, the observer contraction can be simplified into roughly a weighting of pressure and momentum flux compared to the energy density[^12]. We can generally say that a physical solution addressing those conditions can exist only if, for Eulerian observers, the energy density is larger than the magnitude of all of the other tensor terms combined.

One method of creating positive energy is to use spherical matter shell solutions that have a defined ADM mass [5]. In a coordinate system that is asymptotically Minkowski, these are Schwarzschild-like solutions that can be parameterized by their ADM mass (given by $M$ in this paper). Building our warp solution from a matter shell allowed us to use the ADM mass parameter to engineer positive energy density into the solution, while the modified shift vector gave us a warp effect by creating a linear frame dragging inside the shell. However, the amount of mass is limited by the shell radius and thickness so as not to produce an event horizon within the shell ($R_{shell} > 2G M_{shell}/c^2$), so only a limited amount of energy density can be added. Increasing the shift vector will continue to add more momentum flux to the stress-energy tensor, so there is an upper limit to the magnitude of the shift vector that keeps the warp drive physical before the momentum flux exceeds energy density. This upper limit is a future direction of work. We can say that the shift vector distribution considered here is very conservative in terms of its magnitude since we keep the shell at a constant density. However, there are certainly ways to greatly improve this through optimizing the shift vector and energy density profiles to strategically place energy density where the momentum flux is highest.

Another interesting point to note is that, while there does exist a shift vector in the direction of A in the light ray setup, the Shapiro time delay [17], the delay of light travel time due to gravitational time dilation, from B to A is still a delay compared to the propagation time in the corresponding flat region. This is in contrast to the Alcubierre metric, in which an advance is perceived. The presence of a changing lapse rate creates this result, a feature the Alcubierre metric does not have, that is related to the nature of the solution having ADM mass. This constraint may be another important aspect of physicality [21], namely that physical solutions might require a changed lapse rate which maintains a Shapiro time delay over an advance.

### 5.3. Acceleration

The warp solution created here is evaluated for the constant velocity case, but the immediate question is how it applies to the acceleration phase. One possible approach is to have the bubble accelerate by simply accelerating the coordinate center and increasing the magnitude of the shift vector accordingly. However, this approach gives the exact same issue as the Schwarzschild Drive [16], which takes a regular black hole solution and simply moves its center through the timeslices. This approach changes the metric such that it now requires a negative energy density throughout space, asymptotically approaching zero at infinity.

An obvious alternative is to imagine that some basic momentum transfer occurs, where mass is shed in the process of creating the momentum flux in the bubble. In this way, a kind of rocket-like solution could be possible that cancels out the acceleration effects for passengers inside. However, this approach also presents its own problems since the bubble likely requires large amounts of matter to cancel out acceleration inside, thus requiring an even larger ejection of mass to accelerate itself which becomes quickly untenable. In addition, creating the metric itself which describes this situation, has not been done in detail before beyond simple photon rockets [22].

Insight might be gathered by considering the ADM momentum [2] where conservation of the 4-momentum might be a key element to understanding the constraint to warp solutions when creating physically accelerating solutions with ADM mass. The key question in this regard is whether the 'spinning-up' of the warp drive results in the forward motion of the entire structure without the need for any energy ejection. Analyzing non-vacuum spacetimes with non-Schwarzschild boundary conditions might yield valuable insight.

Another alternative is to explore the use of focused gravitational radiation emission as a way to accelerate drives over traditional momentum transfer methods, such as recently discussed in [20]. In the work here, we assumed that $du_i/dt = 0$ in the passenger region during the acceleration phase of the warp drive, but this is not a requirement in general solutions. It is possible that the presence of non-zero shift vector may not be the key source of geodesic transport in all solutions if carefully constructed spatially varying lapse and metric spatial terms exist in the passenger volume. In fact, in the scenario of ejecting matter, the lapse and spatial terms will vary in time and spatially across a given spatial slice. Ultimately, the question of how to make physical and efficient acceleration is one of the foremost problems in warp drive research.

## 6. Conclusion

In this paper, we have developed the first constant velocity subluminal physical warp drive solution to date that is fully consistent with the geodesic transport properties of the Alcubierre metric. It provides geodesic transport of observers while also satisfying the NEC, WEC, DEC, and SEC. This solution was constructed from a stable shell of matter with a modified shift vector on its interior, creating a warp solution with positive ADM mass. Analysis and construction of the shell used a new numerical toolkit called Warp Factory, which was developed by APL for warp research. This exciting new result offers an important first step toward understanding what makes physical warp solutions. Moreover, the warp drive spacetime constructed here is a new type of warp drive beyond the Natario class and hence not subject to the same scope discussed in [9] and [18] due to its use of modified spatial terms in the metric. This new solution shows that a more generic constant velocity warp drive spacetime can be constructed that satisfies the energy conditions.

We intend to explore this solution further and find areas of optimization to improve the mass-to-velocity ratio required to maintain physicality. The metric construction process of smoothing can be replaced by a direct 1D optimization of the radial profiles for density, pressure, and shift vector, possibly reducing required mass by orders of magnitude. In addition, the question of accelerating the drive efficiently without breaking physicality is a major direction of work for the field of warp drive research. The code for the metrics and figures shown here will be provided as an update to the Warp Factory codebase.

Warp Factory can be found at <https://github.com/NerdsWithAttitudes/WarpFactory>.

## Appendix A. Numerical Error Analysis

Using numerical methods for analysis puts constraints on the accuracy of the results due to limitations in finite differencing methods for solving the field equations, representing the spacetime with precision-limited numbers, and discretizing the grid. These errors are summarized below:

1. **Spherical to Cartesian Interpolation Error:** The conversion of the spherical metric to the Cartesian metric uses Legendre polynomials to interpolate points in $r$ to points in $x$, $y$, and $z$. This interpolation introduces errors in the final metric.
2. **Finite Difference Discretization Error:** This error comes about from the discretization of the space into a grid. With lower spatial resolution, the finite difference methods deviate from the true analytical derivatives since the step size of the finite difference algorithm is larger. This error is largest when $f(x+h)-f(x)$ is large compared to the step size $h$.
3. **Floating Point Round-Off Error:** The numerical calculations are done in double precision. This restricts the maximum possible range of floating point values to about 16 orders of magnitude. The solver for the Einstein Field Equations is written to reduce catastrophic cancellation of small numbers, but the double precision limit still restricts meaningful results for the stress-energy tensor and energy condition violation to those of above $10^{34}$ in magnitude.
4. **Finite Difference Truncation Error:** Finally, finite difference truncation error happens when the infinite series that calculates the derivatives is cut off to the fourth order. For the fourth-order finite difference method, the truncation error is below the double precision round-off error floor.

As an example of the error floor in this analysis, we can look at the full returned values of the energy conditions in Figure A1 for the Shell, Boosted Shell, and Warp Shell.

![Figure A1. Energy condition evaluation all the way to below the double precision floor for the Shell and Warp Shell. Only the violating values are shown. The region between R_1 and R_2 is empty as no violation exists and only positive values for all observers are found. No systematic deviation in errors is seen between the metrics. The values of the stress-energy tensor in this work are on the order of 10^39, which leaves a difference between the noise floor of around 10^-6.](figures/Error_All_Violation.png)

**Figure A1.** Energy condition evaluation all the way to below the double precision floor for the Shell and Warp Shell. Only the violating values are shown. The region between $R_1$ and $R_2$ is empty as no violation exists and only positive values for all observers are found. No systematic deviation in errors is seen between the metrics. The values of the stress-energy tensor in this work are on the order of $10^{39}$, which leaves a difference between the noise floor of around $10^{-6}$.

## Appendix B. Lorentz Transformation

The Lorentz factor is given in the usual manner:

$$
\gamma = \frac{1}{\sqrt{(1-\beta^2)}} \tag{B.1}
$$

Applying the Lorentz transformation corresponding to a boost along the positive x-dimension to a comoving metric $g$ results in the new metric $g^\prime$ in terms of the old components as:

$$
g'_{00} = \gamma^2 \left(g_{00} - 2\beta g_{01} + \beta^2 g_{11}\right) \tag{B.2}
$$

$$
g'_{01} = \gamma^2 \left( g_{01} - \beta g_{11} - \beta g_{00} + \beta^2 g_{01} \right) \tag{B.3}
$$

$$
g'_{10} = g'_{01} \tag{B.4}
$$

$$
g'_{02} = \gamma \left( g_{02} - \beta g_{12} \right) \tag{B.5}
$$

$$
g'_{20} = g'_{02} \tag{B.6}
$$

$$
g'_{03} = \gamma \left( g_{03} - \beta g_{13} \right) \tag{B.7}
$$

$$
g'_{30} = g'_{03} \tag{B.8}
$$

$$
g'_{11} = \gamma^2 \left( g_{11} + \beta^2 g_{00} - 2 \beta g_{01} \right) \tag{B.9}
$$

$$
g'_{12} = \gamma \left( g_{12} - \beta g_{02} \right) \tag{B.10}
$$

$$
g'_{21} = g'_{12} \tag{B.11}
$$

$$
g'_{13} = \gamma \left( g_{13} - \beta g_{03} \right) \tag{B.12}
$$

$$
g'_{31} = g'_{13} \tag{B.13}
$$

$$
g'_{22} = g_{22} \tag{B.14}
$$

$$
g'_{33} = g_{33} \tag{B.15}
$$

The direction of the transformation is opposite to the direction of $\beta$.

## References

1. Miguel Alcubierre. LETTER TO THE EDITOR: The warp drive: hyper-fast travel within general relativity. *Classical and Quantum Gravity*, 11(5):L73–L77, May 1994.
2. Richard Arnowitt, Stanley Deser, and Charles W. Misner. Republication of: The dynamics of general relativity. *General Relativity and Gravitation*, 40(9):1997–2027, September 2008.
3. F. Bacchini, B. Ripperda, A. Y. Chen, and L. Sironi. Generalized, Energy-conserving Numerical Simulations of Particles in General Relativity. I. Time-like and Null Geodesics. *Astrophysical Journal*, 237(1):6, July 2018.
4. Alexey Bobrick and Gianni Martire. Introducing physical warp drives. *Classical and Quantum Gravity*, 38(10):105009, May 2021.
5. Leo Brewin. A simple expression for the ADM mass. *General Relativity and Gravitation*, 39(4):521–528, April 2007.
6. Sean M. Carroll. *Spacetime and geometry. An introduction to general relativity*. 2004.
7. L. Filipe O. Costa and José Natário. Frame-Dragging: Meaning, Myths, and Misconceptions. *Universe*, 7(10):388, October 2021.
8. Allen E. Everett and Thomas A. Roman. Superluminal subway: The Krasnikov tube. *Physical Review D*, 56(4):2100–2108, August 1997.
9. Shaun D. B. Fell and Lavinia Heisenberg. Positive energy warp drive from hidden geometric structures. *Classical and Quantum Gravity*, 38(15):155020, August 2021.
10. L. H. Ford and Thomas A. Roman. Averaged energy conditions and quantum inequalities. *Physical Review D*, 51(8):4277–4286, April 1995.
11. Christopher Helmerich, Jared Fuchs, Alexey Bobrick, Luke Sellers, Brandon Melcher, and Gianni Martire. Analyzing warp drive spacetimes with Warp Factory. *Classical and Quantum Gravity*, 41(9):095009, May 2024.
12. Erik W. Lentz. Breaking the Warp Barrier: Hyper-Fast Solitons in Einstein-Maxwell-Plasma Theory. *arXiv e-prints*, page arXiv:2006.07125, June 2020.
13. Erik W. Lentz. Hyper-Fast Positive Energy Warp Drives. *arXiv e-prints*, page arXiv:2201.00652, December 2021.
14. José Natário. Warp drive with zero expansion. *Classical and Quantum Gravity*, 19(6):1157–1165, March 2002.
15. Jessica Santiago, Sebastian Schuster, and Matt Visser. Generic warp drives violate the null energy condition. *Physical Review D*, 105(6):064038, March 2022.
16. Sebastian Schuster, Jessica Santiago, and Matt Visser. ADM mass in warp drive spacetimes. *arXiv e-prints*, page arXiv:2205.15950, May 2022.
17. Irwin I. Shapiro. Fourth Test of General Relativity. *Physical Review Letters*, 13(26):789–791, December 1964.
18. Barak Shoshany and Ben Snodgrass. Warp Drives, Rest Frame Transitions, and Closed Timelike Curves. *arXiv e-prints*, page arXiv:2309.10072, September 2023.
19. Chris Van Den Broeck. A 'warp drive' with more reasonable total energy requirements. *Classical and Quantum Gravity*, 16(12):3973–3979, December 1999.
20. Vijay Varma, Sylvia Biscoveanu, Tousif Islam, Feroz H. Shaik, Carl-Johan Haster, Maximiliano Isi, Will M. Farr, Scott E. Field, and Salvatore Vitale. Evidence of Large Recoil Velocity from a Black Hole Merger Signal. *Physical Review Letters*, 128(19):191102, May 2022.
21. Matt Visser, Bruce Bassett, and Stefano Liberati. Perturbative superluminal censorship and the null energy condition. In C. P. Burgess and R. C. Myers, editors, *General Relativity and Relativistic Astrophysics*, volume 493 of *American Institute of Physics Conference Series*, pages 301–305, November 1999.
22. Y. Wang and X. Lin. Field of an arbitrarily accelerating charged point mass. In *Third Marcel Grossmann Meeting on General Relativity*, pages 1001–1004, January 1983.

[^1]: In the case that a local acceleration is desired, for example, 1g, the statement becomes the 'local acceleration of passengers should be limited'.
[^2]: Ignoring the mass of the passengers.
[^3]: Perhaps, some energy could be radiated to infinity but that energy should be causally connected to the bubble.
[^4]: The non-unitary spatial term will modify the geodesic velocity as $\gamma^{ij}\beta_{j}$
[^5]: In this work, we flip the sign of this condition in Warp Factory so that negative values mean violations in all of the energy conditions shown.
[^6]: See MATLAB 'smooth' function for more details
[^7]: The specific numbers in the setup were found by trial and error. Improved approaches could use more complex techniques than simple moving average smoothing to resolve the boundary violation issues.
[^8]: Selection of the mass parameter is to allow the most amount of the shift vector to the drive while balancing physicality, given the selected radial distribution of the shift vector.
[^9]: This is likely not an upper limit as optimizations could be considered.
[^10]: Reference warp metrics are converted to a comoving frame using a Galilean transformation to their coordinates.
[^11]: An example uses photon paths circling a Kerr black hole which has a transit difference depending on traveling with or against the rotation, this same effect occurs here except these paths are straight through the warp bubble center. Both paths in either example are aligned with or against the shift vector [7].
[^12]: The full energy conditions are determined by contracting the set of all observers (null and timelike) with the tensor, which weights all of the different tensor elements together.
