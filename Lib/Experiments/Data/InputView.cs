using System.Reflection;

namespace Modelling.Lib.Experiments.Data;

public class InputView
{
    public string Label { get; }
    public string ParameterName { get; }

    private readonly Experiment _experiment;
    private readonly FieldInfo _field;

    public InputView(Experiment experiment, FieldInfo field, InputAttribute attribute)
    {
        Label = attribute.Label;
        ParameterName = field.Name;
        _experiment = experiment;
        _field = field;
    }
    
    public InputView(Experiment experiment, string label, string parameterName)
    {
        Label = label;
        ParameterName = parameterName;
        _experiment = experiment;
        _field = experiment.GetType().GetFields().First(f => f.Name == parameterName);
    }
    
    public void SetValue(double input)
    {
        _field.SetValue(_experiment, input);
    }

    public object GetValue()
    {
        return _field.GetValue(_experiment)!;
    }
}