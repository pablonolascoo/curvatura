# Solution physique de propulsion par distorsion à vitesse constante

**Jared Fuchs**$^{\dagger\,1,2}$, **Christopher Helmerich**$^{1,2}$, **Alexey Bobrick**$^{2,3}$, **Luke Sellers**$^{2,4}$, **Brandon Melcher**$^{2}$ et **Gianni Martire**$^{2}$

> Source originale : https://arxiv.org/abs/2405.02709
> Revue : Classical and Quantum Gravity 41, 095013 (2024)
> Licence : CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). © Les auteurs.
> Traduction : projet Curvatura. Texte original en anglais.

$^{1}$ The University of Alabama in Huntsville, 301 Sparkman Drive, Huntsville, Alabama, 35899, États-Unis
$^{2}$ Advanced Propulsion Laboratory at Applied Physics, 477 Madison Avenue, New York, 10022, États-Unis
$^{3}$ Technion - Israel Institute of Technology, Département de physique, Haïfa 32000, Israël
$^{4}$ UCLA Department of Physics & Astronomy, 475 Portola Plaza, Los Angeles, CA 90095, États-Unis

Courriel : $^\dagger$ jef0011@uah.edu et jared@appliedphysics.org

Août 2023

## Résumé

Les dispositifs de propulsion par distorsion sont des solutions exotiques de la relativité générale qui offrent des moyens de transport inédits. Dans cette étude, nous présentons une solution de propulsion par distorsion subluminique à vitesse constante qui satisfait toutes les conditions d'énergie. La solution consiste à combiner une coquille de matière stable avec une distribution du vecteur de décalage qui reproduit fidèlement des solutions de propulsion par distorsion bien connues, comme la métrique d'Alcubierre. Nous générons numériquement la métrique de l'espace-temps, évaluons les conditions d'énergie et confirmons que la distribution du vecteur de décalage ne peut pas être réduite à une transformation de coordonnées. Cette étude démontre que les espaces-temps classiques de propulsion par distorsion peuvent être rendus compatibles avec les conditions d'énergie par l'ajout d'une coquille de matière ordinaire de masse ADM positive.

## 1. Introduction

Les espaces-temps de propulsion par distorsion, introduits d'abord par Alcubierre [1] puis par d'autres auteurs [19, 14], offrent plusieurs propriétés de transport singulières pour des observateurs de genre temps. Ces propriétés incluent la possibilité d'accélérer par un mouvement géodésique, de se déplacer de façon supraluminique ou de se trouver dans des régions d'espace-temps modifié, le tout par rapport à des observateurs extérieurs de genre temps en mouvement inertiel. Tous ces espaces-temps classiques de propulsion par distorsion violent certaines, sinon toutes, les conditions d'énergie [10, 15] ; c'est pourquoi leur construction a longtemps été jugée irréalisable. Toutefois, des travaux récents [13, 4, 9] ont suggéré que des « propulsions par distorsion physiques », satisfaisant certaines ou toutes les conditions d'énergie, pourraient éventuellement être construites, ce qui a ravivé l'intérêt pour le sujet.

En raison de la complexité des équations d'Einstein, la recherche de solutions physiques de propulsion par distorsion par des moyens purement analytiques a progressé lentement. En particulier, deux facteurs qui accroissent considérablement la complexité de ces équations sont les fonctions lapse non unitaires et les métriques spatiales non plates ; tous deux étaient absents de la plupart des solutions antérieures de propulsion par distorsion, et il a été soutenu que tous deux sont nécessaires pour satisfaire les conditions d'énergie [4]. Pour relever ce défi, la boîte à outils numérique *Warp Factory* [11] a été développée afin de fournir des méthodes numériques permettant d'explorer plus complètement les espaces-temps de propulsion par distorsion. Grâce à la souplesse nouvelle qu'offre *Warp Factory*, nous présentons ici une nouvelle solution de propulsion par distorsion subluminique à vitesse constante, avec une fonction lapse non unitaire et une métrique spatiale non plate, qui satisfait toutes les conditions d'énergie.

### 1.1. Caractéristiques essentielles d'un espace-temps de propulsion par distorsion

Une discussion détaillée des propriétés des espaces-temps de propulsion par distorsion se trouve dans [11] ; nous en résumons ici les caractéristiques essentielles par souci de clarté. Les espaces-temps de propulsion par distorsion peuvent être vus comme des modifications d'un espace-temps de fond globalement hyperbolique et asymptotiquement plat, contenant une trajectoire en général non géodésique $\mathcal{C}_{\rm background}$ qui relie deux points arbitraires A et B. Un espace-temps de propulsion par distorsion modifie cet espace-temps de fond de sorte que les propriétés suivantes soient vérifiées :

1. *Transport géodésique :* La trajectoire en général non géodésique $\mathcal{C}_{\rm background}$ de l'espace-temps de fond est envoyée sur une trajectoire géodésique $\mathcal{C}_{\rm background} \rightarrow \mathcal{C}_{\rm warp}$ dans le nouvel espace-temps de propulsion par distorsion. Autrement dit, les espaces-temps de propulsion par distorsion permettent aux passagers de voyager entre les points A et B le long d'une trajectoire géodésique $\mathcal{C}_{\rm warp}$. Cela signifie que les passagers à l'intérieur du dispositif ne subissent aucune accélération locale pendant leur transport[^1]. Pour qu'une solution soit non triviale, la trajectoire initiale $\mathcal{C}_{\rm background}$ ne doit pas être une géodésique, c'est-à-dire que les passagers ne doivent pas « déjà être en route » du point A vers le point B. Un exemple de solution non triviale est celui d'un passager, dans un espace-temps de fond statique, initialement au repos au point A (par rapport au référentiel de repos local), transporté jusqu'au point B, puis de nouveau au repos par rapport au point B. En outre, la modification par distorsion doit affecter le moins possible les distances propres entre A et B mesurées le long du trajet, telles qu'elles sont définies initialement dans l'espace-temps de fond.

2. *Région des passagers vide :* L'espace-temps de propulsion par distorsion possède une région des passagers compacte et vide ($T^{\mu\nu} = 0$)[^2], exempte de forces de marée, qui englobe la trajectoire des passagers $\mathcal{C}_{\rm warp}$.

3. *Une bulle spatialement bornée et comobile :* L'espace-temps de propulsion par distorsion possède une région compacte non vide ($T^{\mu\nu} \neq 0$) qui englobe la trajectoire des passagers $\mathcal{C}_{\rm warp}$ sur chaque tranche de genre espace. Cela signifie que la distribution d'énergie-impulsion nécessaire au transport géodésique ne s'étend pas jusqu'à l'infini[^3] et se déplace avec les observateurs transportés. L'exigence de se déplacer avec les passagers distingue les solutions de propulsion par distorsion des tubes de Krasnikov [8], par exemple.

### 1.2. Conception d'espaces-temps de propulsion par distorsion

L'élément de transport des propulsions par distorsion consiste à concevoir des courbes de genre temps permettant aux passagers de voyager entre les points A et B de l'espace-temps. Dans cet article, nous développerons une solution de distorsion selon les étapes suivantes :

1. Partir d'un fond de Minkowski.
2. Définir deux points A et B dans l'espace-temps.
3. Définir les conditions initiales et finales des passagers qui voyageront entre A et B. Par exemple, les passagers pourraient partir au repos au point A et arriver au repos au point B. De telles conditions initiales peuvent être définies par rapport à un observateur extérieur situé dans un espace de Minkowski.
4. Définir une courbe entre les points A et B le long de laquelle voyageront le dispositif de propulsion et les passagers.
5. Construire une solution métrique qui déplace les passagers, dans le respect des conditions aux limites de (iii), le long de géodésiques ajustées à la courbe de (iv). Plusieurs métriques permettent ces géodésiques particulières, mais une seule suffit.

De manière générale, il existe de nombreuses façons d'y parvenir. Dans le formalisme 3+1, la métrique s'écrit :

$$
ds^2 = -\alpha^2 dt^2 + \gamma_{ij} (dx^i + \beta^i dt)(dx^j + \beta^j dt), \tag{1}
$$

où $\alpha$ est la fonction lapse, $\beta^i$ le vecteur de décalage et $\gamma_{ij}$ la métrique spatiale. On peut considérer les équations géodésiques générales dans le formalisme 3+1, paramétrées par le temps coordonné [3], sous la forme :

$$
\begin{aligned}
&\frac{d x^i}{d t}=\gamma^{i j} \frac{u_j}{u^0}-\beta^i \\
&\frac{d u_i}{d t}=-\alpha u^0 \partial_i \alpha+u_k \partial_i \beta^k-\frac{u_j u_k}{2 u^0} \partial_i \gamma^{j k} \\
&u^0=\left(\gamma^{j k} u_j u_k+\epsilon\right)^{1 / 2} / \alpha
\end{aligned}
\tag{2}
$$

où $u^\mu = dx^\mu/d\tau$ et $\epsilon =$ 1 ou 0 pour les géodésiques de genre temps ou de genre lumière. Les quantités $dx^i/dt$ et $du_i/dt$ dépendent des coordonnées, mais, dans un espace-temps et un système de coordonnées entièrement définis, elles prennent une signification précise. Pour l'illustrer, considérons la métrique d'Alcubierre [1], donnée par :

$$
ds^2 = -d t^2+\left(d x-v_s f\left(r_s\right) d t\right)^2+d y^2+d z^2 \tag{3}
$$

où $r_s= \sqrt{(x-x_s(t))^2 + y^2 + z^2}$. $x_s(t)$ et $v_s(t)$ sont respectivement la position du centre et la vitesse du dispositif de propulsion, et $f(r_s)$ est une fonction de forme qui définit l'extension de la bulle de distorsion à partir du centre. La solution d'Alcubierre consiste à ajouter un vecteur de décalage à un espace-temps par ailleurs minkowskien. Il est donc clair que toutes les caractéristiques propres à la propulsion par distorsion de cet espace-temps proviennent uniquement du vecteur de décalage. On peut le comprendre sous un autre angle, à l'aide des étapes et des équations géodésiques (2) ci-dessus. À l'intérieur de la région du volume des passagers (définie par $r_s < R$), l'espace-temps est contraint d'être plat, ce qui signifie que $\partial_i g_{\mu\nu} = 0$ et donc $du_i/dt = 0$. Le mouvement géodésique des passagers dans le système de coordonnées, à l'intérieur de cette région, est :

$$
\frac{dx^i}{dt} = v_s = \delta^{ij}\frac{u_j}{u^0} - \beta^i \tag{4}
$$

Comme le montre l'équation ci-dessus, le transport géodésique des passagers dépend de leurs $u_i$ au début et à la fin du transport. La solution d'Alcubierre permet l'accélération au moyen d'une vitesse $v_s(t)$ variable dans le temps. Si l'on considère la condition initiale dans laquelle les observateurs sont initialement au repos ($u^i = u_i = 0$) en un certain point, et que l'on imagine qu'une bulle de distorsion se forme autour des passagers avec les mêmes contraintes ($du_i/dt = 0$ pour $r_s < R$), alors $u_i(t) = 0$ à tout instant $t$ et le transport des passagers à l'intérieur de la bulle dans ce scénario est donné par :

$$
\frac{dx^i}{dt} = v_s(t) = -\beta^i(t) \tag{5}
$$

Dans ce contexte, on peut considérer que la solution de propulsion par distorsion d'Alcubierre est capable de transporter des observateurs initialement au repos par rapport à un observateur extérieur stationnaire jusqu'à une vitesse relative $v_s$, le tout au moyen d'un vecteur de décalage localisé dans l'espace-temps, avec une région intérieure plate. Cet exemple de voyage par distorsion est illustré sur la figure 1.

![Figure 1. Exemple de trajectoire de distorsion d'Alcubierre comportant trois phases de vol : (i) Le passager entre dans la bulle de distorsion au repos par rapport à l'observateur de référence au point A. Le passager n'a aucune vitesse coordonnée par rapport à l'observateur de référence (dx^i/dt = u_i = 0). (ii) La bulle de distorsion commence son trajet en accélérant jusqu'à une vitesse constante. Le passager à l'intérieur est transporté géodésiquement jusqu'à la vitesse coordonnée du dispositif de propulsion, mais avec toujours une vitesse nulle mesurée dans son temps propre (dx^i/dt = v_warp). (iii) La bulle de distorsion décélère jusqu'à l'arrêt au point B, au repos par rapport à l'observateur de référence, et le passager sort du dispositif.](figures/warp_example_v3a.png)

**Figure 1.** Exemple de trajectoire de distorsion d'Alcubierre comportant trois phases de vol :
*(i)* Le passager entre dans la bulle de distorsion au repos par rapport à l'observateur de référence au point A. Le passager n'a aucune vitesse coordonnée par rapport à l'observateur de référence ($dx^i/dt = u_i = 0$)
*(ii)* La bulle de distorsion commence son trajet en accélérant jusqu'à une vitesse constante. Le passager à l'intérieur est transporté géodésiquement jusqu'à la vitesse coordonnée du dispositif de propulsion, mais avec toujours une vitesse nulle mesurée dans son temps propre ($dx^i/dt = v_{warp}$).
*(iii)* La bulle de distorsion décélère jusqu'à l'arrêt au point B, au repos par rapport à l'observateur de référence, et le passager sort du dispositif.

Dans cet article, nous nous concentrerons sur l'analyse de la phase à vitesse constante du vol par distorsion. Ce choix de la vitesse constante soulève certaines difficultés car, en l'absence d'accélération, les conditions aux limites des passagers qui entrent dans le dispositif sont moins intéressantes dans le cas comobile simple. Par exemple, si le dispositif de propulsion se déplace toujours à vitesse constante et que ses passagers ont toujours existé de manière comobile à l'intérieur, aucun vecteur de décalage n'est nécessaire, puisque pour les passagers $u_i/u^0 = v_s$ par définition. Bobrick et Martire examinent cet exemple de cas à vitesse constante comme base d'une solution de distorsion physique dans [4], ce qui conduit à une coquille de matière ordinaire. Dans l'exemple d'Alcubierre, la phase à vitesse constante prend un sens important lorsqu'elle est reliée à une phase d'accélération antérieure dans laquelle on définit comment les passagers entrent dans le dispositif. Si le dispositif subit une accélération avec la condition $du_i/dt = 0$, la présence d'un vecteur de décalage pendant la phase à vitesse constante est alors nécessaire, car avant ce moment les passagers avaient $u_i/u^0 < v_s$ et seul un vecteur de décalage peut fournir le $dx^i/dt$ requis sous les contraintes de courbure imposées dans le volume des passagers.

Presque toutes les solutions de distorsion proposées dans la littérature sont essentiellement des variantes de la solution d'Alcubierre et s'appuient sur le vecteur de décalage pour assurer le transport des passagers, au sens discuté ici. L'ajout d'un terme spatial par Van Den Broeck [19] ne sert qu'à utiliser plus efficacement la densité d'énergie par une expansion de volume, mais le décalage joue toujours le même rôle moteur dans le transport que dans la solution d'Alcubierre, puisque le terme spatial est plat dans le volume des passagers[^4]. Les métriques de distorsion de Lentz [13, 12], de Fell et Heisenberg [9] et de la classe plus générale de Natário [14] utilisent toutes plusieurs composantes du vecteur de décalage, mais suivent pour l'essentiel la même dynamique que celle décrite ici. Dans la métrique à symétrie sphérique [4], aucun vecteur de décalage n'est utilisé ; mais, là encore, il s'agit d'une solution à vitesse constante, et l'ajout d'un vecteur de décalage pourrait être nécessaire pour l'étendre à une solution accélérée plus générale.

Bien que les vecteurs de décalage aient été largement utilisés dans la littérature, ils ne sont pas le seul ingrédient permettant de construire des propulsions par distorsion. Des gradients spatiaux de la fonction lapse et des termes spatiaux de la métrique peuvent agir sur $du_i/dt$ puis sur $dx^i/dt$, mais exigent une gestion soigneuse de leurs dérivées spatiales pour éviter la présence d'énergie ou de forces de marée dans le volume des passagers. L'utilisation d'un décalage est, à bien des égards, la méthode la plus simple pour ajouter un transport géodésique, car elle fournit directement aux observateurs un terme $dx^i/dt$ fondé uniquement sur sa norme. Dans ce travail, nous nous concentrerons sur une solution de distorsion qui utilise un vecteur de décalage pour obtenir les mêmes propriétés de propulsion par distorsion que la solution d'Alcubierre, mais d'une manière qui permette de préserver le caractère physique.

### 1.3. Le problème du caractère physique

La condition de propulsion par distorsion physique est discutée en détail dans [4] et dans notre article récent [11] ; pour l'essentiel, l'exigence fondamentale est de satisfaire les conditions d'énergie. Il a été démontré que la classe de solutions de Natário (définie par des vecteurs de décalage avec une fonction lapse unitaire $\alpha=1$ et une métrique spatiale plate $\gamma_{ij}=\delta_{ij}$) viole toujours les conditions d'énergie [15]. Une raison possible de cette violation est que les métriques, telles qu'elles sont construites, ne comportent pas l'effet gravitationnel de la matière ordinaire. Le champ gravitationnel asymptotique produit par un objet gravitant à symétrie sphérique est donné par la métrique de Schwarzschild, qui présente une dépendance asymptotique en $1/r$ dans la fonction lapse et dans les termes spatiaux, en coordonnées de Schwarzschild, à l'infini. Les métriques de distorsion générales à *région de support compact*, c'est-à-dire des métriques dont les composantes sont bornées dans une région finie qui rejoint l'espace de Minkowski plus vite que 1/r, se comportent différemment de la matière ordinaire. On peut l'exprimer autrement à l'aide de la définition de la masse ADM [5], grandeur qui décrit la notion de masse telle qu'elle est vue depuis des régions lointaines. La métrique d'Alcubierre et les solutions analogues ont $M_{ADM} = 0$, contrairement à la métrique de Schwarzschild qui, pour une densité d'énergie de même ordre de grandeur, aurait $M_{ADM} > 0$. Cependant, même si la métrique a une masse ADM non nulle, des violations des conditions d'énergie peuvent facilement se produire. Ce problème est mis en évidence dans les travaux récents de Schuster et al. sur le dispositif de Schwarzschild transporté [16]. Plus encore, même si la solution tend asymptotiquement vers celle d'un espace-temps de matière positive de masse ADM positive, des contraintes supplémentaires doivent être imposées dans la bulle de distorsion non vide. En règle générale, le flux d'impulsion et les pressions eulériens doivent être inférieurs à la densité d'énergie pour satisfaire les conditions d'énergie [11]. Enfin, d'après [4], le mouvement subluminique est probablement une autre exigence importante pour que la métrique soit physique. En résumé, les ingrédients essentiels probables d'une solution physique de propulsion par distorsion peuvent s'énoncer simplement ainsi :

1. L'espace-temps asymptotiquement plat doit avoir une masse ADM positive.
2. En général, une densité d'énergie positive bien supérieure à la fois à la pression et au flux d'impulsion dans la bulle de distorsion non vide, telle que mesurée par les observateurs eulériens.
3. Des vitesses subluminiques

Ces ingrédients physiques guideront la construction de la solution présentée dans cet article.

### 1.4. Structure de l'article

L'article est organisé comme suit : nous présentons d'abord, dans la section 2, l'approche adoptée pour construire un modèle numérique de propulsion par distorsion. Ensuite, dans les sections 3 - 4, nous développons les solutions pour une coquille de matière et sa transformation en coquille de distorsion (Warp Shell) par l'ajout d'un vecteur de décalage. Dans la section 5, nous discutons des implications de cette solution et la comparons aux métriques de distorsion antérieures. Enfin, nous concluons et évoquons les étapes futures dans la section 6.

## 2. Méthodes

Pour surmonter les problèmes rencontrés par le passé par les solutions de distorsion, nous utiliserons une nouvelle approche de construction de solutions de distorsion qui conservent une solution de vide de Schwarzschild à grande distance, avec un tenseur énergie-impulsion à support compact. On y parvient en ajoutant une distribution du vecteur de décalage à une coquille de matière ordinaire. Le vecteur de décalage ajouté est maintenu en dessous du seuil au-delà duquel le flux d'impulsion supplémentaire qui accompagne son ajout entraîne une violation des conditions d'énergie. L'ajout d'un vecteur de décalage aura sur le transport des passagers un effet similaire à celui du dispositif d'Alcubierre, sans aucune violation des conditions d'énergie.

### 2.1. Construction de la bulle

Pour obtenir une solution physique, nous utilisons une coquille de matière en mouvement comme métrique de base de notre dispositif de propulsion par distorsion. Cette solution présente un intérieur plat et, à l'extérieur de la coquille, une solution de Schwarzschild asymptotiquement plate. La solution de coquille sera construite en coordonnées comobiles, dans lesquelles le tenseur métrique ne dépend pas du temps. Dans cette section, nous donnons un résumé général du procédé ; les détails figurent dans la section suivante.

Tout d'abord, il faut examiner à quoi ressemblent les solutions de distorsion dans un référentiel comobile. Comme nous prévoyons d'ajouter un unique vecteur de décalage à une coquille, nous examinons la solution d'Alcubierre dans un référentiel comobile pour connaître la forme du vecteur de décalage à ajouter. Pour transformer la solution d'Alcubierre dans le référentiel stationnaire d'un observateur extérieur comobile de genre temps, on peut utiliser la transformation de Lorentz donnée à l'annexe B, déterminée pour un observateur à l'infini spatial. Il convient de noter que cette transformation nous restreint au régime subluminique, mais c'est là une restriction naturelle pour tout observateur extérieur comobile de genre temps, et c'est le régime le plus susceptible de conduire à des solutions physiques. L'application de la transformation de Lorentz à la métrique d'Alcubierre donne un vecteur de décalage nul pour $r_s \gg R$ et non nul à l'intérieur du volume des passagers, comme le montre la figure 2.

![Figure 2. Exemple de solution d'Alcubierre transformée dans un référentiel comobile au moyen d'une transformation de Lorentz. La courbe statique (bleu) correspond à la métrique sous la forme définie par Alcubierre dans [1]. La courbe comobile (rouge pointillé) correspond à la transformation de Lorentz inverse appliquée à la solution statique. On remarquera que le vecteur de décalage reste identique, tandis que les termes spatiaux et la fonction lapse changent. Ces changements seront remplacés par les termes de la coquille de matière lors de la construction de la solution physique de cet article.](figures/LorentzAlcubierre.png)

**Figure 2.** Exemple de solution d'Alcubierre transformée dans un référentiel comobile au moyen d'une transformation de Lorentz. La courbe statique (bleu) correspond à la métrique sous la forme définie par Alcubierre dans [1]. La courbe comobile (rouge pointillé) correspond à la transformation de Lorentz inverse appliquée à la solution statique. On remarquera que le vecteur de décalage reste identique, tandis que les termes spatiaux et la fonction lapse changent. Ces changements seront remplacés par les termes de la coquille de matière lors de la construction de la solution physique de cet article.

Avec la solution d'Alcubierre transformée ci-dessus, nous pouvons maintenant la comparer à la même configuration pour une coquille de matière ordinaire, généralement définie dans un référentiel comobile, et constater que l'ajout de l'effet de distorsion peut s'exprimer simplement comme l'ajout d'un vecteur de décalage à la métrique de la coquille. Ce vecteur de décalage ajouté $\beta_i$ est appliqué à l'intérieur de la coquille, où la matière est présente pour gérer les contraintes de caractère physique dans la région non vide :

$$
g_{warp shell} = g_{shell}+ \delta g_{warp} \tag{6}
$$

où $\delta g_{warp}$ est une métrique ne contenant qu'une composante du vecteur de décalage selon une seule direction :

$$
\delta g_{warp} = \begin{pmatrix} 0 & \beta_1 & 0 & 0 \\
\beta_1 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \\
0 & 0 & 0 & 0 \end{pmatrix} \tag{7}
$$

Les détails de la coquille et de sa modification par distorsion sont décrits dans les sections 3 et 4.

Comme pour la métrique d'Alcubierre, nous pouvons revenir aux équations géodésiques (2) pour décrire l'effet de cette solution sur les passagers. Bien que nous ne modélisions pas ici la phase d'accélération, on peut la considérer comme analogue au cas d'Alcubierre. Plus précisément, la région des passagers à l'intérieur de cette coquille devra être plate dans le cas à vitesse constante ; on peut donc de nouveau supposer que $du_i/dt = 0$. Nous poserons également $u_i = 0$, comme pour la métrique d'Alcubierre, afin de considérer des solutions possibles reliées à une phase d'accélération antérieure ayant maintenu $du_i/dt = 0$. Cependant, cette fois, la solution de coquille n'aura pas de termes spatiaux minkowskiens, et le mouvement coordonné est donc désormais donné par :

$$
\frac{d x^i}{d t}= - \beta^i = - \gamma^{i j}\beta_j \tag{8}
$$

Enfin, une question parfois discutée en théorie de la distorsion est la nature du transport des passagers par rapport au mouvement de la bulle, en particulier lorsque le vecteur de décalage décroît jusqu'à zéro à la frontière. Dans le cas d'une propulsion par distorsion à vitesse constante, où la métrique ne varie pas dans le référentiel comobile, la matière de la bulle elle-même « se déplacera » toujours, par définition, en restant alignée avec le volume des passagers. C'est une conséquence du fait que la bulle elle-même est une fonction génératrice du vecteur de décalage, déterminée par la métrique à travers l'équation du champ d'Einstein. Cela est vrai pour toutes les solutions de distorsion à vitesse constante.

### 2.2. Méthodes numériques

Dans cette section, nous présentons un résumé de notre méthode numérique. Nous effectuons l'analyse numérique avec la boîte à outils Warp Factory, présentée en détail dans [11]. Tout au long de cet article, nous adopterons le formalisme 3+1 et donnerons toujours le tenseur énergie-impulsion eulérien et ses composantes (pression, flux d'impulsion et densité d'énergie) à l'aide des méthodes de la section 3 de [11]. Dans Warp Factory, le changement de référentiel est effectué localement sur le tenseur métrique en chaque point au moyen d'un tétrade correspondant aux observateurs eulériens, qui ramène également la métrique locale à la forme de Minkowski. Ce tétrade de transformation est appliqué au tenseur énergie-impulsion et fournit le tenseur énergie-impulsion mesuré par les observateurs eulériens. L'observateur eulérien dans ce référentiel est défini de manière standard par :

$$
n_{\mu} = (1, 0, 0, 0) \tag{9}
$$

La densité d'énergie $\rho$, le flux d'impulsion $p_i$, la pression isotrope $P_i$ et le tenseur des contraintes $\sigma_{ij}$ observés en tout point par l'observateur eulérien à partir du tenseur eulérien $T^{\hat{\mu}\hat{\nu}}$ sont :

$$
\begin{gathered}
\rho = T^{\hat{0}\hat{0}} \\
p_i = T^{\hat{0}\hat{i}} \\
P_i = T^{\hat{i}\hat{i}} \\
\sigma_{ij} = T^{\hat{i}\hat{j}}
\end{gathered}
\tag{10}
$$

La procédure de définition et d'évaluation des conditions d'énergie, décrite en détail dans la section 3 de [11], est rappelée ici par souci de clarté. La condition d'énergie nulle (NEC) est donnée par la contraction d'observateurs de genre lumière avec le tenseur énergie-impulsion en tout point de l'espace-temps ($X$) :

$$
\Xi_{NEC}(X) = T_{\hat{\mu}\hat{\nu}}(X) k^{\hat{\mu}} k^{\hat{\nu}} \ge 0 \ \ \forall \ \ k^{\hat{\mu}} \tag{11}
$$

où $k^{\hat{\mu}}$ sont des observateurs de genre lumière. La condition d'énergie faible (WEC) est analogue à la NEC, mais avec la contraction d'observateurs de genre temps en tout point de l'espace-temps :

$$
\Xi_{WEC}(X) = T_{\hat{\mu}\hat{\nu}}(X) V^{\hat{\mu}} V^{\hat{\nu}} \ge 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{12}
$$

où $V^{\hat{\mu}}$ sont des observateurs de genre temps. La condition d'énergie forte (SEC) s'obtient elle aussi en contractant des observateurs de genre temps avec le tenseur énergie-impulsion :

$$
\Xi_{SEC}(X) = \left(T_{\hat{\mu}\hat{\nu}}(X) - \frac{1}{2} T(X) \eta_{\hat{\mu}\hat{\nu}} \right)V^{\hat{\mu}} V^{\hat{\nu}} \ge 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{13}
$$

Enfin, la condition d'énergie dominante (DEC) est obtenue en contractant le tenseur énergie-impulsion sous forme mixte avec les observateurs de genre temps :

$$
\Upsilon^{\hat{\mu}}(X) = -T^{\hat{\mu}}_{\ \ \hat{\nu}}(X) V^{\hat{\nu}} \tag{14}
$$

où $\Upsilon^{\hat{\mu}}\left(X\right)$ doit être orienté vers le futur, c'est-à-dire que $\Upsilon^{\hat{\mu}}$ doit être de genre temps ou de genre lumière, ce qui se traduit par[^5] :

$$
\xi_D(X) = \eta_{\hat{\mu}\hat{\nu}} \Upsilon^{\hat{\mu}}(X) \Upsilon^{\hat{\nu}}(X) \le 0 \ \ \forall \ \ V^{\hat{\mu}} \tag{15}
$$

Le champ vectoriel des observateurs est échantillonné avec une densité d'orientations spatiales de 100 échantillons et, pour les observateurs de genre temps, avec une densité supplémentaire de normes de vitesse de 10 échantillons (voir [11] pour une discussion détaillée de cette méthode).

## 3. Métrique de coquille

La base de la solution de distorsion est une coquille de matière stable. Nous commençons par construire cette coquille dans un référentiel comobile, en coordonnées de Schwarzschild.

### 3.1. Définition de la métrique

La solution de coquille est construite à partir d'une métrique générale statique et à symétrie sphérique, de la forme [6] :

$$
ds^2 = -e^{2a}dt^2 + e^{2b}dr^2 + d\Omega^2 \tag{16}
$$

Les fonctions $a$ et $b$ peuvent être obtenues en résolvant l'équation du champ avec un tenseur énergie-impulsion connu. Pour une solution simple fondée sur le tenseur énergie-impulsion d'un fluide isotrope, le procédé est direct ; les composantes du tenseur énergie-impulsion dans le référentiel eulérien sont :

$$
T^{iso}_{\hat{\mu}\hat{\nu}} = \textrm{diag}(\rho,P,P,P) \tag{17}
$$

Cependant, pour une coquille stable, les pressions $P$ ne peuvent pas être supposées isotropes, car le rayon intérieur doit résister à la pression gravitationnelle dirigée vers l'intérieur, ce qui conduit à des termes de pression non uniformes selon les directions $\theta$ et $\phi$, à la manière de la contrainte circonférentielle dans un cylindre. Avec une pression non isotrope, la solution prend la forme :

$$
T^{shell}_{\hat{\mu}\hat{\nu}} = \textrm{diag}(\rho,P_1,P_2,P_3) \tag{18}
$$

Pour obtenir la solution de coquille non isotrope, nous adopterons une approche itérative consistant à trouver $a$ et $b$ comme des modifications de la solution isotrope, en changeant la pression et la densité supposées qui servent à déterminer $a$ et $b$ dans le cas isotrope. Le procédé se résume brièvement ainsi :

1. Partir d'une solution d'essai initiale pour la métrique de la coquille en supposant une densité constante $\rho^\prime$ entre le rayon intérieur $R_1$ et le rayon extérieur $R_2$.
2. Déterminer le profil de pression d'essai initial $P^\prime(r)$ en supposant que la pression dans la coquille est isotrope et nulle en $r = R_2$, à l'aide de l'équation de Tolman-Oppenheimer-Volkoff (TOV). Après résolution de l'équation différentielle avec l'unique condition aux limites en $r = R_2$, il reste une pression constante à l'intérieur ; cette pression est fixée à zéro pour $r < R_1$ afin d'imposer un intérieur vide.
3. L'hypothèse de densité constante crée des frontières abruptes en $R_1$ et $R_2$, et l'hypothèse de pression isotrope n'est pas valable à la frontière $R_1$ pour maintenir une coquille stable. Pour y remédier, nous adoucissons la frontière par un lissage radial appliqué à $\rho^{\prime}$ et $P^{\prime}$ au moyen d'une fonction $f_{smooth}$.
4. Les grandeurs lissées $\tilde{\rho}$ et $\tilde{P}$ servent ensuite à déterminer les termes $a$ et $b$ qui construisent la métrique effective. Le calcul du tenseur énergie-impulsion à partir des équations du champ d'Einstein fournit alors les véritables $\rho$ et $P_i$ correspondant à la métrique obtenue à cette étape.
5. Enfin, la fonction de lissage de la pression et de la densité est itérée aux étapes (iii) et (iv) jusqu'à obtenir une métrique qui satisfait les conditions d'énergie aux frontières.

Le déroulement du procédé de construction de la solution métrique décrit ci-dessus est représenté sur la figure 3.

![Figure 3. Méthode de création de la métrique dans laquelle des solutions d'essai sont utilisées puis modifiées pour construire une solution de coquille physique. Le procédé part de la densité, à gauche, et produit une solution à droite.](figures/ShellConstructionDiagram.png)

**Figure 3.** Méthode de création de la métrique dans laquelle des solutions d'essai sont utilisées puis modifiées pour construire une solution de coquille physique. Le procédé part de la densité, à gauche, et produit une solution à droite.

La version détaillée du procédé esquissé ci-dessus est la suivante. L'hypothèse de départ pour le profil de densité $\rho^\prime$ est celle d'une coquille sphérique de rayon intérieur $R_1$ et de rayon extérieur $R_2$, de densité constante et de masse totale $M$. La densité est ainsi définie par :

$$
\rho^\prime(r) =
\begin{cases}
 0 & 0 \leq r \leq R_1 \\
 \frac{3}{4\pi}\frac{M}{R_2^3-R_1^3} & R_1 \leq r \leq R_2 \\
 0 & R_2 \leq r < \infty
\end{cases}
\tag{19}
$$

et le profil de masse cumulée associé $m^\prime(r)$ est simplement l'intégrale de la densité en deçà d'un rayon donné $r$, ce qui donne :

$$
m^\prime(r) = \int_0^r 4 \pi r^2 \rho^\prime(r) dr =
\begin{cases}
 0 & 0 \leq r \leq R_1 \\
M\left(\frac{r^3-R_1^3}{R_2^3-R_1^3}\right) & R_1 \leq r \leq R_2 \\
 M & R_2 \leq r < \infty
\end{cases}
\tag{20}
$$

À partir des définitions de la densité et de la masse cumulée, on peut résoudre numériquement l'équation TOV pour $P^\prime$ lorsque $R_1<r<R_2$, avec une condition aux limites de pression nulle en $r = R_2$, et imposer $P^\prime = 0$ pour $r < R_1$ :

$$
\frac{dP^\prime}{dr} =
\begin{cases}
 0 & 0 \leq r < R_1 \\
-G\left(\rho^\prime/c^2+P^\prime/c^4\right)\left(m^\prime/r^2+4\pi r P^\prime/c^2\right)\left(1-\frac{2Gm^\prime}{c^2 r}\right)^{-1} & R_1 < r \leq R_2 \\
0 & R_2 \leq r < \infty
\end{cases}
\tag{21}
$$

Cette solution initiale présente des problèmes en $R_1$ et $R_2$ en raison de la discontinuité de la densité et de la pression ; on y remédie en appliquant un lissage numérique à $\rho^{\prime}$ et à $P^{\prime}$ :

$$
\begin{aligned}
&\tilde{\rho} = f_{smooth}(\rho^\prime) \\
&\tilde{P} = f_{smooth}(P^\prime)
\end{aligned}
\tag{22}
$$

La fonction de lissage appliquée est une moyenne mobile, c'est-à-dire un filtre passe-bas dont les coefficients sont égaux à l'inverse de la largeur de la moyenne[^6]. Le lissage lui-même corrige la discontinuité en donnant des valeurs finies aux dérivées aux frontières, tout en conservant une solution physique. Les coefficients de la fonction de lissage sont déterminés de manière itérative jusqu'à ce que la solution ne présente plus aucune violation des conditions d'énergie nulle, faible, dominante et forte. Une fois le lissage appliqué, il faut recalculer le nouveau profil de masse comme précédemment, avec la nouvelle densité $\tilde{\rho}(r)$ :

$$
m(r) = \int_0^r 4 \pi r^2 \tilde{\rho}(r) dr \tag{23}
$$

Les valeurs lissées de la pression et de la densité peuvent maintenant servir à déterminer les termes métriques $a$ et $b$. Le profil de masse détermine directement $b$, qui fournit $e^{2b}$ comme simple extension de la solution de Schwarzschild avec $M = m$ [6, section 5.8, éq. 5.143] :

$$
e^{2b} = \left(1 - \frac{2Gm}{c^2 r} \right)^{-1} \tag{24}
$$

Le second terme, $e^{2a}$, s'obtient en résolvant pour $a$ [6, section 5.8, éq. 5.152] :

$$
\frac{d a}{dr} = G\left(\frac{m}{c^2 r^2} +\frac{4\pi r}{c^4} \tilde{P}\right)\left(1-\frac{2Gm}{c^2 r}\right)^{-1} \tag{25}
$$

Cette équation est intégrée avec la condition qu'en $r \gg R_2$ la frontière est fixée par $e^{2a} = e^{-2b}$, ce qui correspond à une solution de Schwarzschild dans la région de vide. La largeur, ou fenêtre, $s$ de la fonction de lissage est choisie différemment pour la densité et pour la pression ; nous avons constaté qu'un rapport entre les largeurs de densité et de pression $s_\rho / s_P \approx 1.72$ convient[^7]. Le lissage par moyenne mobile est appliqué quatre fois, avec la même largeur et les mêmes rapports, à la densité et à la pression pour obtenir la solution finale. Pour une coquille de paramètres $R_1 = 10$ m, $R_2 = 20$ m, $M = 4.49\times 10^{27}$ kg ($2.365$ masses de Jupiter)[^8], la pression et la densité avant et après lissage sont représentées sur la figure 4. Le procédé fournit jusqu'ici une solution pour la métrique en coordonnées sphériques. La dernière étape consiste à transformer cette solution en coordonnées pseudo-cartésiennes, commodes pour définir la grille numérique, en changeant les coordonnées et leurs différentielles au moyen des relations usuelles entre coordonnées sphériques et cartésiennes. Numériquement, les solutions radiales pour $e^{2a}$ et $e^{2b}$ sont interpolées aux points de la grille cartésienne à l'aide de polynômes de Legendre. La métrique construite à partir de ces paramètres est représentée sur la figure 5.

![Figure 4. Profils de densité et de pression avant et après lissage pour la construction de la métrique de coquille.](figures/Shell_Smoothed_Values.png)

**Figure 4.** Profils de densité et de pression avant et après lissage pour la construction de la métrique de coquille.

![Figure 5. Composantes des métriques de coquille et de Schwarzschild pour une coupe le long de l'axe y. Seules les composantes non minkowskiennes de cette coupe sont représentées. Dans g_22, la ligne verticale en tirets indique l'endroit où r = r_s pour la métrique de Schwarzschild de référence, là où le signe des parties spatiales s'inverse.](figures/Shell_Metric.png)

**Figure 5.** Composantes des métriques de coquille et de Schwarzschild pour une coupe le long de l'axe y. Seules les composantes non minkowskiennes de cette coupe sont représentées. Dans $g_{22}$, la ligne verticale en tirets indique l'endroit où $r = r_s$ pour la métrique de Schwarzschild de référence, là où le signe des parties spatiales s'inverse.

![Figure 6. Composantes du tenseur énergie-impulsion de la coquille pour une coupe le long de l'axe y. Seules les composantes non nulles de cette coupe sont représentées. Les courbes de densité et de pression lissées sont celles calculées à partir de l'éq. (22). On notera que la densité d'énergie est multipliée par un facteur c^2.](figures/Shell_Energy.png)

**Figure 6.** Composantes du tenseur énergie-impulsion de la coquille pour une coupe le long de l'axe y. Seules les composantes non nulles de cette coupe sont représentées. Les courbes $\tilde{\rho}$ et $\tilde{P}$ sont la densité et la pression lissées calculées à partir de l'éq. (22). On notera que la densité d'énergie est multipliée par un facteur c$^2$.

### 3.2. Tenseur énergie-impulsion

Les termes énergie-impulsion obtenus, mesurés par les observateurs eulériens, sont représentés sur la figure 6. Le long de chacune des directions coordonnées principales, la pression d'entrée $\tilde{P}$ utilisée pour déterminer $a$ à partir de l'éq. (25) est égale à la pression $P$ calculée du tenseur énergie-impulsion dans cette direction, puisque celle-ci est alignée avec la direction radiale. Les pressions selon les directions x et z sont égales et diffèrent de la pression selon y, avec un pic important sur la limite intérieure de la coquille. Le choix de lisser la pression et la densité est fait délibérément pour obtenir une solution à pressions non isotropes, modifiée à partir de la solution isotrope par un filtre de lissage. Pour une coquille statique, la frontière intérieure en $R_1$ exige une différence de pression entre les pressions radiales et la pression angulaire pour garantir la stabilité de la coquille vis-à-vis de l'effondrement gravitationnel. Cela se manifeste par une sorte de contrainte circonférentielle autour du rayon intérieur de la coquille. Il importe également que toutes ces pressions soient inférieures en valeur absolue à la densité d'énergie au même point, pour garantir le caractère physique de la coquille. Pour des matériaux réalistes, dont la gamme de pressions admissibles peut être limitée, cette exigence peut toujours être satisfaite en agrandissant la coquille et en modifiant le profil de densité, ce qui réduit les forces gravitationnelles. Le caractère physique de la solution est démontré en vérifiant les conditions d'énergie à l'aide de la boîte à outils Warp Factory [11], comme le montre la figure 7. Il n'existe aucune violation des conditions d'énergie au-delà des limites de précision numérique, qui se situent à $10^{34}$ dans cette configuration (voir l'annexe A pour une discussion détaillée des erreurs et des limites numériques).

![Figure 7. Conditions d'énergie de la coquille pour une coupe le long de l'axe y. Les valeurs négatives représentent des violations de la condition. Aucune valeur négative n'est trouvée. Unités : [j/m^3]](figures/Shell_Violation.png)

**Figure 7.** Conditions d'énergie de la coquille pour une coupe le long de l'axe y. Les valeurs négatives représentent des violations de la condition. Aucune valeur négative n'est trouvée. Unités : $[j/m^3]$

## 4. Coquille de distorsion à vitesse constante

Comme indiqué dans l'introduction, une propulsion par distorsion capable de transporter différents observateurs peut le faire au moyen d'un vecteur de décalage à l'intérieur du volume des passagers. La tâche consiste donc à ajouter un champ de vecteur de décalage à une solution de coquille tout en préservant les conditions d'énergie.

### 4.1. Définition de la métrique

À partir de la solution de coquille construite dans la section 3, nous modifions maintenant la région intérieure de la coquille comobile afin qu'elle possède un vecteur de décalage selon la direction du mouvement, ici l'axe x. La modification doit respecter quelques contraintes pour constituer une propulsion par distorsion cohérente avec notre définition :

1. La région intérieure doit rester plate, c'est-à-dire que toutes les dérivées spatiales de la métrique doivent être nulles ($\partial_i g_{\mu\nu} = 0$). Ce choix garantit que les passagers se trouvent dans le vide et ne subissent aucune force de marée.
2. La région de transition du vecteur de décalage doit se situer entre $R_1$ et $R_2$ et se raccorder de façon lisse à la solution extérieure en $R_2$, où $\beta_i = 0$.

La modification du décalage modifie le terme $g_{01}$ comme suit :

$$
g^{warp}_{01} = g_{01} - S_{warp}(r)\left(g_{01} + \beta_{warp}\right) \tag{26}
$$

où $S_{warp}$ est une fonction sigmoïde à support compact définie par :

$$
S_{warp}(r) =
\begin{cases}
1 & r < R_1+R_{b} \\
1-f(r) & R_1+R_{b} < r < R_2 - R_{b} \\
0 & r > R_2-R_{b}
\end{cases}
\tag{27}
$$

et $f(r)$ est donnée par :

$$
f(r) = \left(\exp\left[(R_2-R_1)\left(\frac{1}{r-R_2}+\frac{1}{r-R_1}\right)\right]+1\right)^{-1} \tag{28}
$$

où $R_b>0$ est une zone tampon garantissant que les dérivées restent à l'intérieur de la bulle. Nous construisons une coquille de matière avec les mêmes paramètres que dans la section 3. En faisant varier $\beta_{warp}$, nous constatons qu'il est possible d'ajouter un décalage à l'intérieur de la coquille pour $\beta_{warp} = 0.02$ sans aucune violation des conditions d'énergie[^9]. Les composantes de cette métrique sont représentées sur la figure 8.

![Figure 8. Composantes de la métrique de la coquille de distorsion à vitesse constante pour une coupe le long de l'axe y. Seules les composantes non minkowskiennes de cette coupe sont représentées. La direction du mouvement est +X.](figures/Warp_Metric.png)

**Figure 8.** Composantes de la métrique de la coquille de distorsion à vitesse constante pour une coupe le long de l'axe y. Seules les composantes non minkowskiennes de cette coupe sont représentées. La direction du mouvement est +X.

### 4.2. Caractère physique

Pour comprendre le caractère physique de cette solution, nous commençons par représenter les termes énergie-impulsion obtenus sur la figure 9. La densité d'énergie reste pratiquement inchangée par rapport à celle d'une coquille en mouvement standard, mais la modification du vecteur de décalage entraîne une différence dans les valeurs d'impulsion et de pression pour les observateurs eulériens. Le changement le plus notable par rapport à la métrique de coquille concerne l'impulsion, dont la densité était nulle entre $R_1$ et $R_2$. Cette solution modifiée présente une densité d'impulsion à la fois positive et négative autour de $r \approx (R_2-R_1)/2$, ce qui indique la formation d'un motif de circulation dans le flux d'impulsion de la coquille. Le même type de structure de flux d'impulsion est également observé pour une solution d'Alcubierre [11]. Les conditions d'énergie sont évaluées pour cette métrique et présentées sur la figure 10. Modifier ainsi le vecteur de décalage n'a aucun effet sur les violations par rapport à la solution de coquille de matière ordinaire.

Des représentations en surface de la solution pour une coupe centrée selon la direction $Z$ sont données pour la métrique sur la figure 11, pour la densité d'énergie sur la figure 12, pour les autres composantes du tenseur énergie-impulsion sur la figure 13 et pour l'évaluation des conditions d'énergie sur la figure 14.

![Figure 9. Composantes du tenseur énergie-impulsion de la coquille de distorsion à vitesse constante pour une coupe le long de l'axe y cartésien. La direction du mouvement est +X. On notera que la densité d'énergie est multipliée par un facteur c^2 et la densité d'impulsion par un facteur c.](figures/Warp_Energy.png)

**Figure 9.** Composantes du tenseur énergie-impulsion de la coquille de distorsion à vitesse constante pour une coupe le long de l'axe y cartésien. La direction du mouvement est +X. On notera que la densité d'énergie est multipliée par un facteur c$^2$ et la densité d'impulsion par un facteur c.

![Figure 10. Conditions d'énergie de la coquille de distorsion à vitesse constante pour une coupe le long de l'axe y. La direction du mouvement est +X. Les valeurs négatives représentent des violations de la condition. Aucune valeur négative n'est trouvée.](figures/Warp_Violation.png)

**Figure 10.** Conditions d'énergie de la coquille de distorsion à vitesse constante pour une coupe le long de l'axe y. La direction du mouvement est +X. Les valeurs négatives représentent des violations de la condition. Aucune valeur négative n'est trouvée.

### 4.3. Coupes transversales

![Figure 11. Métrique de la coquille de distorsion à vitesse constante dans le référentiel comobile. La direction du mouvement est +X. La coupe est centrée en Z. Seules les coupes non nulles sont représentées.](figures/Warp_Metric_Surf.png)

**Figure 11.** Métrique de la coquille de distorsion à vitesse constante dans le référentiel comobile. La direction du mouvement est +X. La coupe est centrée en Z. Seules les coupes non nulles sont représentées.

![Figure 12. Densité d'énergie de la coquille de distorsion à vitesse constante. La direction du mouvement est +X. La coupe selon Z est alignée avec le centre de la bulle. Unités : [J/m^3]](figures/Warp_Energy_Density_Surf.png)

**Figure 12.** Densité d'énergie de la coquille de distorsion à vitesse constante. La direction du mouvement est +X. La coupe selon Z est alignée avec le centre de la bulle. Unités : $[J/m^3]$

![Figure 13. Tenseur énergie-impulsion de la coquille de distorsion à vitesse constante dans le référentiel comobile, pour les observateurs eulériens. La densité d'énergie est représentée sur la figure 12. La direction du mouvement est +X. La coupe selon Z est alignée avec le centre de la bulle. Seules les coupes non nulles sont représentées. Unités : [J/m^3]](figures/Warp_Energy_Surf.png)

**Figure 13.** Tenseur énergie-impulsion de la coquille de distorsion à vitesse constante dans le référentiel comobile, pour les observateurs eulériens. La densité d'énergie est représentée sur la figure 12. La direction du mouvement est +X. La coupe selon Z est alignée avec le centre de la bulle. Seules les coupes non nulles sont représentées. Unités : $[J/m^3]$

![Figure 14. Évaluation des conditions d'énergie pour la coquille de distorsion à vitesse constante. La direction du mouvement est +X. La coupe selon Z est alignée avec le centre de la bulle. La valeur minimale sur l'ensemble des observateurs est représentée. Les valeurs positives (bleu) et nulles (blanc) sont physiques et les valeurs négatives (rouge) indiquent une violation. Unités : [J/m^3]](figures/Warp_Violation_Surf.png)

**Figure 14.** Évaluation des conditions d'énergie pour la coquille de distorsion à vitesse constante. La direction du mouvement est +X. La coupe selon Z est alignée avec le centre de la bulle. La valeur minimale sur l'ensemble des observateurs est représentée. Les valeurs positives (bleu) et nulles (blanc) sont physiques et les valeurs négatives (rouge) indiquent une violation. Unités : $[J/m^3]$

## 5. Discussion

### 5.1. Mesure du décalage

L'ajout d'un vecteur de décalage au volume des passagers d'une coquille entraîne plusieurs changements dans la solution. Pour distinguer complètement une coquille de distorsion d'une coquille de matière ordinaire, on peut construire un test invariant en comparant des rayons lumineux qui traversent la bulle et en mesurant la différence de temps de transit entre deux trajets de rayons qui la parcourent dans le sens du vecteur de décalage et en sens inverse. La métrique étant déjà définie dans un référentiel comobile, il suffit de faire passer des géodésiques de genre lumière par le centre de la coquille, dirigées vers l'avant et vers l'arrière selon la direction du vecteur de décalage, et d'enregistrer le temps propre $\delta t$ nécessaire au retour de chaque photon, mesuré aux points d'émission, en négligeant l'interaction des photons avec le tenseur énergie-impulsion. La figure 15 présente un schéma du dispositif de test pour chacun des trajets des photons lorsqu'ils traversent la coquille et reviennent au point d'émission. Cette configuration de test est construite dans Warp Factory et les temps des rayons lumineux sont déterminés numériquement. En effectuant ce test, nous trouvons que la coquille de distorsion (de la section 4) présente $\delta t \approx 7.6$ ns et la coquille de matière (de la section 3) $\delta t = 0$ ns. Comme attendu, une coquille ordinaire présente un temps de transit identique pour les deux rayons lumineux, tandis que la coquille de distorsion présente une différence de temps de transit selon le sens dans lequel le rayon la traverse. Ce retard n'est pas propre à la coquille de distorsion de cet article : il s'observe aussi pour d'autres propulsions par distorsion proposées qui utilisent un vecteur de décalage. À l'aide de Warp Factory, nous avons mené la même expérience numérique pour quelques-unes des propulsions par distorsion discutées dans la littérature, et toutes présentent $\delta t > 0$, comme l'indique le tableau 1[^10]. Cette expérience démontre l'existence d'un effet Lense-Thirring pour les propulsions par distorsion à vecteur de décalage, qui produit un *entraînement linéaire des référentiels*[^11]. Le temps de parcours des photons étant une grandeur mesurable, la modification de la métrique de coquille par le vecteur de décalage ne peut pas être réduite à une transformation de coordonnées.

![Figure 15. Schéma du test par rayons lumineux. Les émetteurs, détecteurs et miroirs sont comobiles avec la coquille étudiée. On notera que les deux faisceaux passent par le centre, mais qu'ils sont décalés sur le schéma pour plus de lisibilité. L'émetteur-détecteur B est aligné verticalement avec les miroirs de gauche et l'émetteur-détecteur A avec les miroirs de droite. Les émetteurs-détecteurs A et B sont équidistants du centre de la coquille. Le trajet de retour des deux faisceaux peut se situer n'importe où à l'extérieur de la coquille. L'effet de distorsion de la coquille de distorsion s'exerce dans la direction horizontale, en s'éloignant de B et vers A.](figures/LightRayTest.png)

**Figure 15.** Schéma du test par rayons lumineux. Les émetteurs, détecteurs et miroirs sont comobiles avec la coquille étudiée. On notera que les deux faisceaux passent par le centre, mais qu'ils sont décalés sur le schéma pour plus de lisibilité. L'émetteur-détecteur B est aligné verticalement avec les miroirs de gauche et l'émetteur-détecteur A avec les miroirs de droite. Les émetteurs-détecteurs A et B sont équidistants du centre de la coquille. Le trajet de retour des deux faisceaux peut se situer n'importe où à l'extérieur de la coquille. L'effet de distorsion de la coquille de distorsion s'exerce dans la direction horizontale, en s'éloignant de B et vers A.

**Tableau 1.** Comparaison du retard temporel entre différents modèles de distorsion et la coquille de matière pour $v_{warp} = 0.04$ c.

| Nom | Paramètres | $\delta t$ [ns] |
|:---:|:---:|:---:|
| **Alcubierre** [1] | $R$ = 15 m | 8.0 |
| **Van Den Broeck** [19] | $R_1$ = 10 m, $R_2$ = 15 m, $\alpha$ = $0.1$ | 9.1 |
| **Temps modifié** [4] | $R$ = 15 m, A = 2 | 6.7 |
| **Coquille de matière** (section 3) | $R_1$ = 10 m, $R_2$ = 20 m, M = $4.49 \times 10^{27}$ kg | 0 |
| **Coquille de distorsion** (section 4) | $R_1$ = 10 m, $R_2$ = 20 m, M = $4.49\times 10^{27}$ kg | 7.6 |

### 5.2. Densité d'énergie positive

La satisfaction ou non des conditions d'énergie par un espace-temps se comprend au mieux à partir des relations entre la densité d'énergie, les pressions et le flux d'impulsion dans le référentiel eulérien ($T^{\hat{\mu}\hat{\nu}}$) [11], puisque la NEC comme la WEC ne font qu'exprimer la manière dont les différents éléments du tenseur énergie-impulsion sont perçus par différents observateurs. Dans le référentiel eulérien, la contraction avec les observateurs se ramène approximativement à une pondération de la pression et du flux d'impulsion par rapport à la densité d'énergie[^12]. On peut dire de manière générale qu'une solution physique respectant ces conditions ne peut exister que si, pour les observateurs eulériens, la densité d'énergie est supérieure à la somme des normes de tous les autres termes du tenseur.

Une méthode pour produire de l'énergie positive consiste à utiliser des solutions de coquille sphérique de matière ayant une masse ADM définie [5]. Dans un système de coordonnées asymptotiquement minkowskien, il s'agit de solutions de type Schwarzschild, qui peuvent être paramétrées par leur masse ADM (notée $M$ dans cet article). Construire notre solution de distorsion à partir d'une coquille de matière nous a permis d'utiliser le paramètre de masse ADM pour introduire de façon contrôlée une densité d'énergie positive dans la solution, tandis que le vecteur de décalage modifié nous a fourni un effet de distorsion en créant un entraînement linéaire des référentiels à l'intérieur de la coquille. Cependant, la quantité de masse est limitée par le rayon et l'épaisseur de la coquille, afin de ne pas produire d'horizon des événements à l'intérieur de celle-ci ($R_{shell} > 2G M_{shell}/c^2$) ; seule une quantité limitée de densité d'énergie peut donc être ajoutée. Augmenter le vecteur de décalage continuera d'ajouter du flux d'impulsion au tenseur énergie-impulsion ; il existe donc une borne supérieure de la norme du vecteur de décalage qui préserve le caractère physique de la propulsion par distorsion avant que le flux d'impulsion ne dépasse la densité d'énergie. Cette borne supérieure constitue une piste de travail future. On peut dire que la distribution du vecteur de décalage considérée ici est très prudente quant à sa norme, puisque nous maintenons la coquille à densité constante. Il existe toutefois certainement des moyens de l'améliorer considérablement en optimisant les profils du vecteur de décalage et de la densité d'énergie, de façon à placer stratégiquement la densité d'énergie là où le flux d'impulsion est le plus élevé.

Un autre point intéressant est que, bien qu'il existe un vecteur de décalage dirigé vers A dans le dispositif à rayons lumineux, le retard de Shapiro [17] — le retard du temps de parcours de la lumière dû à la dilatation gravitationnelle du temps — de B vers A reste un retard par rapport au temps de propagation dans la région plate correspondante. Cela contraste avec la métrique d'Alcubierre, dans laquelle on perçoit une avance. Ce résultat est dû à la présence d'une fonction lapse variable, caractéristique absente de la métrique d'Alcubierre et liée au fait que la solution possède une masse ADM. Cette contrainte pourrait constituer un autre aspect important du caractère physique [21] : les solutions physiques pourraient exiger une fonction lapse modifiée qui maintienne un retard de Shapiro plutôt qu'une avance.

### 5.3. Accélération

La solution de distorsion construite ici est évaluée dans le cas à vitesse constante, mais la question immédiate est de savoir comment elle s'applique à la phase d'accélération. Une approche possible consiste à faire accélérer la bulle en accélérant simplement le centre des coordonnées et en augmentant en conséquence la norme du vecteur de décalage. Cependant, cette approche pose exactement le même problème que le dispositif de Schwarzschild [16], qui prend une solution ordinaire de trou noir et se contente de déplacer son centre d'une tranche temporelle à l'autre. Cette approche modifie la métrique de telle sorte qu'elle requiert désormais une densité d'énergie négative dans tout l'espace, tendant asymptotiquement vers zéro à l'infini.

Une alternative évidente consiste à imaginer qu'un transfert d'impulsion élémentaire se produit, avec éjection de masse lors de la création du flux d'impulsion dans la bulle. On pourrait ainsi obtenir une sorte de solution de type fusée qui compenserait les effets de l'accélération pour les passagers à l'intérieur. Cette approche présente toutefois ses propres difficultés, car la bulle nécessite probablement de grandes quantités de matière pour compenser l'accélération en son sein, ce qui exige une éjection de masse encore plus importante pour s'accélérer elle-même et devient rapidement intenable. De plus, la construction de la métrique décrivant cette situation n'a pas encore été réalisée en détail au-delà des simples fusées à photons [22].

On pourrait progresser en considérant l'impulsion ADM [2], la conservation de la quadri-impulsion pouvant être un élément clé pour comprendre les contraintes qui pèsent sur les solutions de distorsion lors de la construction de solutions physiquement accélérées dotées d'une masse ADM. La question essentielle à cet égard est de savoir si la « mise en rotation » de la propulsion par distorsion entraîne le mouvement vers l'avant de toute la structure sans nécessiter d'éjection d'énergie. L'analyse d'espaces-temps non vides avec des conditions aux limites autres que celles de Schwarzschild pourrait apporter des éclairages précieux.

Une autre alternative consiste à explorer l'utilisation d'une émission focalisée de rayonnement gravitationnel pour accélérer les dispositifs, plutôt que les méthodes traditionnelles de transfert d'impulsion, comme cela a été discuté récemment dans [20]. Dans le présent travail, nous avons supposé que $du_i/dt = 0$ dans la région des passagers pendant la phase d'accélération de la propulsion par distorsion, mais ce n'est pas une exigence pour les solutions générales. Il est possible que la présence d'un vecteur de décalage non nul ne soit pas la source principale du transport géodésique dans toutes les solutions, si le volume des passagers comporte une fonction lapse et des termes spatiaux de la métrique variant spatialement et construits avec soin. En fait, dans le scénario d'éjection de matière, la fonction lapse et les termes spatiaux varieront dans le temps et dans l'espace sur une tranche spatiale donnée. En définitive, la question de savoir comment obtenir une accélération physique et efficace est l'un des problèmes majeurs de la recherche sur la propulsion par distorsion.

## 6. Conclusion

Dans cet article, nous avons développé la première solution physique de propulsion par distorsion subluminique à vitesse constante obtenue à ce jour qui soit pleinement cohérente avec les propriétés de transport géodésique de la métrique d'Alcubierre. Elle assure le transport géodésique des observateurs tout en satisfaisant la NEC, la WEC, la DEC et la SEC. Cette solution a été construite à partir d'une coquille de matière stable dotée d'un vecteur de décalage modifié en son intérieur, ce qui donne une solution de distorsion de masse ADM positive. L'analyse et la construction de la coquille ont fait appel à une nouvelle boîte à outils numérique, Warp Factory, développée par APL pour la recherche sur la distorsion. Ce nouveau résultat prometteur constitue une première étape importante vers la compréhension de ce qui rend physiques les solutions de distorsion. En outre, l'espace-temps de propulsion par distorsion construit ici est un nouveau type de propulsion par distorsion qui dépasse la classe de Natário et n'entre donc pas dans le même champ que celui discuté dans [9] et [18], en raison de l'utilisation de termes spatiaux modifiés dans la métrique. Cette nouvelle solution montre qu'il est possible de construire un espace-temps de propulsion par distorsion à vitesse constante plus général qui satisfait les conditions d'énergie.

Nous comptons poursuivre l'étude de cette solution et identifier des pistes d'optimisation pour améliorer le rapport masse/vitesse nécessaire au maintien du caractère physique. Le procédé de construction de la métrique par lissage peut être remplacé par une optimisation directe en 1D des profils radiaux de densité, de pression et de vecteur de décalage, ce qui pourrait réduire la masse requise de plusieurs ordres de grandeur. Par ailleurs, la question de l'accélération efficace du dispositif sans perte du caractère physique constitue une orientation majeure de travail dans le domaine de la recherche sur la propulsion par distorsion. Le code des métriques et des figures présentées ici sera fourni sous la forme d'une mise à jour du code de Warp Factory.

Warp Factory est disponible à l'adresse <https://github.com/NerdsWithAttitudes/WarpFactory>.

## Annexe A. Analyse de l'erreur numérique

L'utilisation de méthodes numériques limite la précision des résultats, en raison des limites des méthodes de différences finies pour résoudre les équations du champ, de la représentation de l'espace-temps par des nombres de précision finie et de la discrétisation de la grille. Ces erreurs sont résumées ci-dessous :

1. **Erreur d'interpolation des coordonnées sphériques vers cartésiennes :** La conversion de la métrique sphérique en métrique cartésienne utilise des polynômes de Legendre pour interpoler des points en $r$ vers des points en $x$, $y$ et $z$. Cette interpolation introduit des erreurs dans la métrique finale.
2. **Erreur de discrétisation des différences finies :** Cette erreur provient de la discrétisation de l'espace en une grille. Avec une résolution spatiale plus faible, les méthodes de différences finies s'écartent des véritables dérivées analytiques, puisque le pas de l'algorithme de différences finies est plus grand. Cette erreur est maximale lorsque $f(x+h)-f(x)$ est grand par rapport au pas $h$.
3. **Erreur d'arrondi en virgule flottante :** Les calculs numériques sont effectués en double précision. Cela limite la plage maximale des valeurs en virgule flottante à environ 16 ordres de grandeur. Le solveur des équations du champ d'Einstein est écrit de manière à réduire l'annulation catastrophique des petits nombres, mais la limite de la double précision restreint néanmoins les résultats significatifs pour le tenseur énergie-impulsion et les violations des conditions d'énergie à ceux dont la valeur absolue dépasse $10^{34}$.
4. **Erreur de troncature des différences finies :** Enfin, l'erreur de troncature des différences finies survient lorsque la série infinie qui calcule les dérivées est tronquée au quatrième ordre. Pour la méthode de différences finies du quatrième ordre, l'erreur de troncature est inférieure au plancher d'erreur d'arrondi de la double précision.

À titre d'exemple du plancher d'erreur de cette analyse, on peut examiner les valeurs complètes renvoyées pour les conditions d'énergie sur la figure A1, pour la coquille, la coquille boostée (Boosted Shell) et la coquille de distorsion.

![Figure A1. Évaluation des conditions d'énergie jusqu'en dessous du plancher de la double précision pour la coquille et la coquille de distorsion. Seules les valeurs en violation sont représentées. La région entre R_1 et R_2 est vide, car aucune violation n'y existe et seules des valeurs positives sont trouvées pour tous les observateurs. Aucun écart systématique des erreurs n'est observé entre les métriques. Les valeurs du tenseur énergie-impulsion dans ce travail sont de l'ordre de 10^39, ce qui laisse un écart d'environ 10^-6 par rapport au plancher de bruit.](figures/Error_All_Violation.png)

**Figure A1.** Évaluation des conditions d'énergie jusqu'en dessous du plancher de la double précision pour la coquille et la coquille de distorsion. Seules les valeurs en violation sont représentées. La région entre $R_1$ et $R_2$ est vide, car aucune violation n'y existe et seules des valeurs positives sont trouvées pour tous les observateurs. Aucun écart systématique des erreurs n'est observé entre les métriques. Les valeurs du tenseur énergie-impulsion dans ce travail sont de l'ordre de $10^{39}$, ce qui laisse un écart d'environ $10^{-6}$ par rapport au plancher de bruit.

## Annexe B. Transformation de Lorentz

Le facteur de Lorentz est défini de la manière habituelle :

$$
\gamma = \frac{1}{\sqrt{(1-\beta^2)}} \tag{B.1}
$$

L'application de la transformation de Lorentz correspondant à un boost selon la direction x positive à une métrique comobile $g$ donne la nouvelle métrique $g^\prime$, exprimée en fonction des anciennes composantes par :

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

Le sens de la transformation est opposé à celui de $\beta$.

## Références

1. Miguel Alcubierre. LETTER TO THE EDITOR: The warp drive: hyper-fast travel within general relativity. *Classical and Quantum Gravity*, 11(5):L73–L77, mai 1994.
2. Richard Arnowitt, Stanley Deser et Charles W. Misner. Republication of: The dynamics of general relativity. *General Relativity and Gravitation*, 40(9):1997–2027, septembre 2008.
3. F. Bacchini, B. Ripperda, A. Y. Chen et L. Sironi. Generalized, Energy-conserving Numerical Simulations of Particles in General Relativity. I. Time-like and Null Geodesics. *Astrophysical Journal*, 237(1):6, juillet 2018.
4. Alexey Bobrick et Gianni Martire. Introducing physical warp drives. *Classical and Quantum Gravity*, 38(10):105009, mai 2021.
5. Leo Brewin. A simple expression for the ADM mass. *General Relativity and Gravitation*, 39(4):521–528, avril 2007.
6. Sean M. Carroll. *Spacetime and geometry. An introduction to general relativity*. 2004.
7. L. Filipe O. Costa et José Natário. Frame-Dragging: Meaning, Myths, and Misconceptions. *Universe*, 7(10):388, octobre 2021.
8. Allen E. Everett et Thomas A. Roman. Superluminal subway: The Krasnikov tube. *Physical Review D*, 56(4):2100–2108, août 1997.
9. Shaun D. B. Fell et Lavinia Heisenberg. Positive energy warp drive from hidden geometric structures. *Classical and Quantum Gravity*, 38(15):155020, août 2021.
10. L. H. Ford et Thomas A. Roman. Averaged energy conditions and quantum inequalities. *Physical Review D*, 51(8):4277–4286, avril 1995.
11. Christopher Helmerich, Jared Fuchs, Alexey Bobrick, Luke Sellers, Brandon Melcher et Gianni Martire. Analyzing warp drive spacetimes with Warp Factory. *Classical and Quantum Gravity*, 41(9):095009, mai 2024.
12. Erik W. Lentz. Breaking the Warp Barrier: Hyper-Fast Solitons in Einstein-Maxwell-Plasma Theory. *arXiv e-prints*, arXiv:2006.07125, juin 2020.
13. Erik W. Lentz. Hyper-Fast Positive Energy Warp Drives. *arXiv e-prints*, arXiv:2201.00652, décembre 2021.
14. José Natário. Warp drive with zero expansion. *Classical and Quantum Gravity*, 19(6):1157–1165, mars 2002.
15. Jessica Santiago, Sebastian Schuster et Matt Visser. Generic warp drives violate the null energy condition. *Physical Review D*, 105(6):064038, mars 2022.
16. Sebastian Schuster, Jessica Santiago et Matt Visser. ADM mass in warp drive spacetimes. *arXiv e-prints*, arXiv:2205.15950, mai 2022.
17. Irwin I. Shapiro. Fourth Test of General Relativity. *Physical Review Letters*, 13(26):789–791, décembre 1964.
18. Barak Shoshany et Ben Snodgrass. Warp Drives, Rest Frame Transitions, and Closed Timelike Curves. *arXiv e-prints*, arXiv:2309.10072, septembre 2023.
19. Chris Van Den Broeck. A 'warp drive' with more reasonable total energy requirements. *Classical and Quantum Gravity*, 16(12):3973–3979, décembre 1999.
20. Vijay Varma, Sylvia Biscoveanu, Tousif Islam, Feroz H. Shaik, Carl-Johan Haster, Maximiliano Isi, Will M. Farr, Scott E. Field et Salvatore Vitale. Evidence of Large Recoil Velocity from a Black Hole Merger Signal. *Physical Review Letters*, 128(19):191102, mai 2022.
21. Matt Visser, Bruce Bassett et Stefano Liberati. Perturbative superluminal censorship and the null energy condition. Dans C. P. Burgess et R. C. Myers, éditeurs, *General Relativity and Relativistic Astrophysics*, volume 493 de *American Institute of Physics Conference Series*, pages 301–305, novembre 1999.
22. Y. Wang et X. Lin. Field of an arbitrarily accelerating charged point mass. Dans *Third Marcel Grossmann Meeting on General Relativity*, pages 1001–1004, janvier 1983.

[^1]: Si une accélération locale est souhaitée, par exemple de 1g, l'énoncé devient « l'accélération locale des passagers doit être limitée ».
[^2]: En négligeant la masse des passagers.
[^3]: Une partie de l'énergie pourrait éventuellement être rayonnée à l'infini, mais cette énergie devrait être causalement reliée à la bulle.
[^4]: Le terme spatial non unitaire modifiera la vitesse géodésique sous la forme $\gamma^{ij}\beta_{j}$
[^5]: Dans ce travail, nous inversons le signe de cette condition dans Warp Factory afin que les valeurs négatives signifient des violations pour toutes les conditions d'énergie présentées.
[^6]: Voir la fonction « smooth » de MATLAB pour plus de détails.
[^7]: Les valeurs numériques précises de la configuration ont été trouvées par essais et erreurs. Des approches améliorées pourraient recourir à des techniques plus élaborées qu'un simple lissage par moyenne mobile pour résoudre les problèmes de violation aux frontières.
[^8]: Le paramètre de masse est choisi de façon à autoriser la plus grande quantité possible de vecteur de décalage dans le dispositif tout en préservant le caractère physique, compte tenu de la distribution radiale choisie pour le vecteur de décalage.
[^9]: Il ne s'agit probablement pas d'une borne supérieure, des optimisations pouvant être envisagées.
[^10]: Les métriques de distorsion de référence sont converties dans un référentiel comobile par une transformation de Galilée appliquée à leurs coordonnées.
[^11]: Un exemple est celui des trajectoires de photons qui tournent autour d'un trou noir de Kerr, dont le temps de transit diffère selon qu'ils se déplacent dans le sens de la rotation ou en sens inverse ; le même effet se produit ici, à ceci près que les trajectoires sont rectilignes et traversent le centre de la bulle de distorsion. Dans les deux exemples, les deux trajets sont alignés dans le sens du vecteur de décalage ou en sens inverse [7].
[^12]: Les conditions d'énergie complètes sont déterminées en contractant l'ensemble de tous les observateurs (de genre lumière et de genre temps) avec le tenseur, ce qui pondère conjointement tous les éléments du tenseur.
