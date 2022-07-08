namespace Modelling.Lib.Experiments.Data;

public class Graph
{
    public Guid Id { get; } = Guid.NewGuid();
    public string Color { get; }
    public Func<(double, double)> ValueProvider { get; }

    private (double, double) _previousValue;
    
    public Graph(Func<(double, double)> valueProvider, string color)
    {
        Color = color;
        ValueProvider = valueProvider;
    }

    public bool IsValueChanged(out (double, double) value)
    {
        var curValue = ValueProvider.Invoke();
        if (!curValue.Equals(_previousValue))
        {
            _previousValue = value = curValue;
            return true;
        }

        value = default;
        return false;
    }
}