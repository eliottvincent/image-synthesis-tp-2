// Définition de la classe Scene

// superclasses et classes nécessaires
Requires("GrilleXZ");
Requires("Pyramide");

class Scene
{
    /** constructeur */
    constructor()
    {
        // créer les objets à dessiner
        this.m_GrilleXZ = new GrilleXZ(50);
        this.m_Pyramide = new Pyramide();

        // couleur du fond : gris foncé
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // créer les matrices utilisées
        this.m_MatViewModel = mat4.create();
        this.m_MatView = mat4.create();
        this.m_MatProjection = mat4.create();
    }


    /**
     * appelée quand la taille de la vue OpenGL change
     * @param width : largeur en nombre de pixels de la fenêtre
     * @param height : hauteur en nombre de pixels de la fenêtre
     */
    onSurfaceChanged(width, height)
    {
        // met en place le viewport
        gl.viewport(0, 0, width, height);

        // matrice de projection
        mat4.perspective(this.m_MatProjection, Utils.radians(20.0), width / height, 0.1, 25.0);
    }


    /**
     * Dessine l'image courante
     */
    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

        // positionner la caméra en (0,0,15), c'est à dire la scène est décalée en z=-9
        mat4.identity(this.m_MatView);
        mat4.translate(this.m_MatView, this.m_MatView, vec3.fromValues(0, 0, -17));
        mat4.rotateX(this.m_MatView, this.m_MatView, Utils.radians(60.0));
        mat4.rotateY(this.m_MatView, this.m_MatView, Utils.radians(0.0));

        // dessiner la grille
        this.m_GrilleXZ.onDraw(this.m_MatProjection, this.m_MatView);

        mat4.identity(this.m_MatViewModel);

        let date = new Date();
        let sec = date.getSeconds();
        //let sec = Utils.Time;
        let min = date.getMinutes();
        let hours = date.getHours();

        sec = sec * 6;
        min = min * 6;
        hours = hours * 30;

        // dessiner l'horloge

        // cadran
        for(let i = 0; i<24; i++) {
            if (i%2 === 0) {
                let angle = Utils.radians(360 / 12 * i / 2);
                mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(3*Math.cos(angle), 0, 3*Math.sin(angle)));
                mat4.rotateX(this.m_MatViewModel, this.m_MatViewModel, Utils.radians(90.0));
                mat4.rotateZ(this.m_MatViewModel, this.m_MatViewModel, Utils.radians(90.0 + i / 2  * 30));

                mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.3, 0.2));
                this.m_Pyramide.onDraw(this.m_MatProjection, this.m_MatViewModel);

            }
            let angle = Utils.radians(360 / 24 *i);
            mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(3*Math.cos(angle), 0, 3*Math.sin(angle)));
            mat4.rotateX(this.m_MatViewModel, this.m_MatViewModel, Utils.radians(90.0));
            mat4.rotateZ(this.m_MatViewModel, this.m_MatViewModel, Utils.radians(270.0 + i * 15));

            mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 0.75, 0.2));
            this.m_Pyramide.onDraw(this.m_MatProjection, this.m_MatViewModel);
        }

        // trotteuse (secondes)
        mat4.rotateX(this.m_MatViewModel, this.m_MatView, Utils.radians(90));
        mat4.rotateZ(this.m_MatViewModel, this.m_MatViewModel, Utils.radians(sec+180));
        mat4.translate(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 1.5, 0.2));
        this.m_Pyramide.onDraw(this.m_MatProjection, this.m_MatViewModel);

        // grande aiguille (minutes)
        mat4.rotateX(this.m_MatViewModel, this.m_MatView, Utils.radians(90));
        mat4.rotateZ(this.m_MatViewModel, this.m_MatViewModel, Utils.radians(min+180));
        mat4.translate(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.2, 1, 0.2));
        this.m_Pyramide.onDraw(this.m_MatProjection, this.m_MatViewModel);

        // heures (petite aiguille)
        mat4.rotateX(this.m_MatViewModel, this.m_MatView, Utils.radians(90));
        mat4.rotateZ(this.m_MatViewModel, this.m_MatViewModel, Utils.radians(hours+180));  //vec3.fromValues(0,0,1)
        mat4.translate(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0, 0, 0));
        mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.1, 0.7, 0.2));
        this.m_Pyramide.onDraw(this.m_MatProjection, this.m_MatViewModel);
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_GrilleXZ.destroy();
        this.m_Pyramide.destroy();
    }
}
