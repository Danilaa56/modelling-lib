using Microsoft.AspNetCore.SignalR;
using Modelling.Lib.Experiments.Data;
using Modelling.Lib.Experiments.Interface;

namespace Modelling.Lib.Experiments;

public class UpdateDataTimer : IDisposable
{
    private readonly IHubContext<ExperimentHub, IExperimentHub> _hubContext;
    private readonly Timer _timer;
    private readonly Experiment _experiment;

    private int _ticks;
    private int _lastIterationsCount;

    private const int Period = 10;

    public UpdateDataTimer(IHubContext<ExperimentHub, IExperimentHub> hubContext, Experiment experiment)
    {
        _hubContext = hubContext;
        _experiment = experiment;
        _timer = new Timer(TimerTick, null, 500, Period);
    }

    private void TimerTick(object? obj)
    {
        if (++_ticks == 1000 / Period)
        {
            var iterationsCount = _experiment.IterationCount;
            if (_lastIterationsCount < iterationsCount)
            {
                _hubContext.Clients.All.ConsoleLog($"{iterationsCount - _lastIterationsCount} iterations per second");
            }

            _lastIterationsCount = iterationsCount;
            _ticks = 0;
        }

        foreach (var view in _experiment.DataViews.Values)
        {
            if (view.IsValueChanged(out var value))
            {
                _hubContext.Clients.All.UpdateData(view.ParameterName, value).Wait();
            }
        }

        if (_experiment.State == ExperimentState.Running)
        {
            var updates = new List<GraphAddPointDto>();
            foreach (var graph in _experiment.Graphs)
            {
                if (graph.IsValueChanged(out var point))
                {
                    updates.Add(new GraphAddPointDto(graph.Id, point.Item1, point.Item2));
                }
            }

            if (updates.Count > 0)
            {
                _hubContext.Clients.All.GraphAddPoint(updates);
            }
        }
    }

    public void Dispose()
    {
        _timer.Dispose();
    }
}