namespace Modelling.Lib.Experiments.Data;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public class InputAttribute : Attribute
{
    public string Label { get; }
    
    public InputAttribute(string value)
    {
        Label = value;
    }
}