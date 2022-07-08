namespace Modelling.Lib.Experiments.Data;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public class DataAttribute : Attribute
{
    public string Label { get; }
    public string Suffix { get; }
    
    public DataAttribute(string value, string suffix = "")
    {
        Label = value;
        Suffix = suffix;
    }
}