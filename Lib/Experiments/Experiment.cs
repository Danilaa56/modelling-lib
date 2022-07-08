using Microsoft.AspNetCore.SignalR;
using Modelling.Lib.Experiments.Data;
using Modelling.Lib.Experiments.Interface;

namespace Modelling.Lib.Experiments;

public abstract partial class Experiment
{
    public Dictionary<string, DataView> DataViews { get; } = new();
    public Dictionary<string, InputView> InputViews { get; } = new();
    public List<Graph> Graphs { get; } = new();

    private readonly ExperimentThread _thread;
    private readonly UpdateDataTimer _updateDataTimer;
    private readonly IHubContext<ExperimentHub, IExperimentHub> _hubContext;
    
    public volatile ExperimentState State = ExperimentState.NotLaunched;
    public int IterationCount { get; private set; }

    protected Experiment(IServiceProvider serviceProvider)
    {
        CreateDataAndInputViews();
        _hubContext = serviceProvider.GetRequiredService<IHubContext<ExperimentHub, IExperimentHub>>();
        _thread = new ExperimentThread(this);
        _updateDataTimer = new UpdateDataTimer(_hubContext, this);
    }

    protected void InitGraph(Func<(double, double)> a, string color = "black")
    {
        Graphs.Add(new Graph(a, color));
    }

    private void CreateDataAndInputViews()
    {
        foreach (var field in GetType().GetFields())
        { 
            var attribute = field.CustomAttributes.FirstOrDefault(data => data.AttributeType == typeof(DataAttribute)); 
            if (attribute is not null)
            {
                var args = attribute.ConstructorArguments.Select(argument => argument.Value).ToArray();
                var dataAttribute = (DataAttribute) attribute.Constructor.Invoke(args);
                DataViews[field.Name] = new DataView(this, field, dataAttribute);
                continue;
            }
            
            attribute = field.CustomAttributes.FirstOrDefault(data => data.AttributeType == typeof(InputAttribute));
            if (attribute is null) continue;
            {
                var args = attribute.ConstructorArguments.Select(argument => argument.Value).ToArray();
                var inputAttribute = (InputAttribute)attribute.Constructor.Invoke(args);
                InputViews[field.Name] = new InputView(this, field, inputAttribute);
            }
        }
    }

    public void Iter()
    {
        IterationCount++;
        OnIter();
    }

    protected virtual bool IsInputValid(out List<string>? reasons)
    {
        reasons = default;
        return true;
    }
    
    protected abstract void OnIter();
    protected abstract void OnReset();
}