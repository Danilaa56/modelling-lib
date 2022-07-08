using Microsoft.AspNetCore.SignalR;
using Modelling.Lib.Experiments.Data;

namespace Modelling.Lib.Experiments.Interface;

public class ExperimentHub : Hub<IExperimentHub>
{
    private readonly Experiment _experiment;

    public ExperimentHub(ExperimentHostedService experimentHostedService)
    {
        _experiment = experimentHostedService.Experiment!;
    }

    public void Launch()
    {
        _experiment.Launch();
    }

    public void Reset()
    {
        _experiment.Reset();
    }

    public void Pause()
    {
        _experiment.Pause();
    }

    public void Resume()
    {
        _experiment.Resume();
    }

    public void InputData(string parameterName, double value)
    {
        Reset();
        _experiment.InputViews[parameterName].SetValue(value);
    }

    public async Task UpdateData(string parameterName, object value)
    {
        await Clients.All.UpdateData(parameterName, value);
    }

    public async Task RequestUi()
    {
        foreach (var view in _experiment.DataViews.Values)
            await CreateDataView(view);

        foreach (var view in _experiment.InputViews.Values)
            await CreateInputView(view);

        foreach (var graph in _experiment.Graphs)
            await CreateGraph(graph);
    }

    private async Task CreateGraph(Graph graph)
    {
        await Clients.Caller.CreateGraph(graph.Id, graph.Color);
    }

    private async Task CreateDataView(DataView view)
    {
        await Clients.Caller.CreateDataView(
            view.Label,
            view.ParameterName,
            view.GetValue(),
            view.Suffix);
    }

    private async Task CreateInputView(InputView inputView)
    {
        await Clients.Caller.CreateInputView(
            inputView.Label,
            inputView.ParameterName,
            inputView.GetValue());
    }
}