namespace Modelling.Lib.Experiments;

public class ExperimentThread
{
    private readonly Experiment _experiment;
    private readonly Thread _thread;
    private volatile bool _shouldStop;
        
    public ExperimentThread(Experiment experiment)
    {
        _experiment = experiment;
        _thread = new Thread(Run);
    }

    public void Start()
    {
        _thread.Start();
    }

    private void Run()
    {
        lock (this)
        {
            while (!_shouldStop)
            {
                while (_experiment.State == ExperimentState.Running && !_shouldStop)
                {
                    _experiment.Iter();
                }

                Monitor.Wait(this);                
            }
        }
    }

    public void Stop()
    {
        _shouldStop = true;
        lock (this)
        {
            Monitor.Pulse(this);
        }
    }
}