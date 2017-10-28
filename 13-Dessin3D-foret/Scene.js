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
        this.m_GrilleXZ = new GrilleXZ(50, 50);
        this.m_Pyramide = new Pyramide();

        // couleur du fond : gris foncé
        gl.clearColor(0.9, 0.9, 0.9, 1.0);

        // activer le depth buffer
        gl.enable(gl.DEPTH_TEST);

        // activer la suppression des faces cachées
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        // créer les matrices utilisées
        this.m_MatView = mat4.create();
        this.m_MatViewModel = mat4.create();
        this.m_MatProjection = mat4.create();

        this.m_numberOfPyramids = 10;
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
        mat4.perspective(this.m_MatProjection, Utils.radians(30.0), width/height, 0.1, 50.0);
    }


    /**
     * Dessine l'image courante
     */
    onDrawFrame()
    {
        // effacer l'écran
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // positionner la caméra en (0,0,10), c'est à dire la scène est décalée en z=-10
        mat4.identity(this.m_MatView);
        mat4.translate(this.m_MatView, this.m_MatView, vec3.fromValues(0, 0, -25));
        mat4.rotateX(this.m_MatView, this.m_MatView, Utils.radians(40.0));
        //mat4.rotateY(this.m_MatView, this.m_MatView, Utils.radians(30.0)*Utils.Time);

        // dessiner la grille
        this.m_GrilleXZ.onDraw(this.m_MatProjection, this.m_MatView);

        // dessiner la foret
        for (let i = - this.m_numberOfPyramids / 2; i < this.m_numberOfPyramids / 2; i++) {
            for (let j = - this.m_numberOfPyramids / 2; j < this.m_numberOfPyramids / 2; j++) {

                mat4.translate(this.m_MatViewModel, this.m_MatView, vec3.fromValues(i, 0, j));
                mat4.scale(this.m_MatViewModel, this.m_MatViewModel, vec3.fromValues(0.3, 0.5, 0.6));
                this.m_Pyramide.onDraw(this.m_MatProjection, this.m_MatViewModel);
            }
        }
    }


    /** supprime tous les objets de cette scène */
    destroy()
    {
        this.m_GrilleXZ.destroy();
        this.m_Pyramide.destroy();
    }
}
