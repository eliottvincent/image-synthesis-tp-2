// Définition de la classe CounterStep
// cette classe est un compteur de N en N


class CounterStep extends Counter
{
    /** constructeur */
    constructor(step, initval=0)
    {
        super(initval);
        this.m_Step = step;
    }


    /** incrémentation */
    increment()
    {
        this.m_Value += this.m_Step;
        console.debug("incrementation");
    }
}
