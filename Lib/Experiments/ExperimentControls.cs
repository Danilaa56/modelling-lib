namespace Modelling.Lib.Experiments;

public abstract partial class Experiment
{
    public void Launch()
    {
        if (State == ExperimentState.Running) return;
        Reset();

        if (!IsInputValid(out var reasons))
        {
            foreach (var reason in reasons!)
            {
                _hubContext.Clients.All.Popup(reason);
            }

            return;
        }
        
        OnReset();
        State = ExperimentState.Running;
        lock (_thread)
        {
            Monitor.Pulse(_thread);
        }
    }

    public void Reset()
    {
        if (State == ExperimentState.NotLaunched) return;

        State = ExperimentState.NotLaunched;

        lock (_thread)
        {
        }

        _hubContext.Clients.All.OnReset().Wait();
        OnReset();
    }

    public void Pause()
    {
        if (State != ExperimentState.Running) return;

        State = ExperimentState.Paused;
        lock (_thread)
        {
        }
    }

    public void Resume()
    {
        if (State != ExperimentState.Paused) return;

        State = ExperimentState.Running;
        lock (_thread)
        {
            Monitor.Pulse(_thread);
        }
    }

    public void Start()
    {
        _thread.Start();
    }

    public void Stop()
    {
        _thread.Stop();
        _updateDataTimer.Dispose();
    }
}