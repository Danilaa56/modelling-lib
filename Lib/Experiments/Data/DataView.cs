using System.Reflection;

namespace Modelling.Lib.Experiments.Data;

public class DataView
{
    public string Label { get; }
    public string ParameterName { get; }
    public string Suffix { get; }

    private readonly Experiment _experiment;
    private readonly FieldInfo _field;
    private object? _previousValue;

    public DataView(Experiment experiment, FieldInfo field, DataAttribute attribute)
    {
        Label = attribute.Label;
        ParameterName = field.Name;
        Suffix = attribute.Suffix;
        _experiment = experiment;
        _field = field;
    }
    
    public DataView(Experiment experiment, string label, string parameterName, string suffix)
    {
        Label = label;
        ParameterName = parameterName;
        Suffix = suffix;
        _experiment = experiment;
        _field = _experiment.GetType().GetFields().First(f => f.Name == parameterName);
    }

    public bool IsValueChanged(out object value)
    {
        var curValue = GetValue();
        if (!curValue.Equals(_previousValue))
        {
            _previousValue = value = curValue;
            return true;
        }

        value = default!;
        return false;
    }

    public object GetValue()
    {
        return _field.GetValue(_experiment)!;
    }
}