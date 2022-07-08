using Modelling.Lib.Experiments.Data;

namespace Modelling.Lib.Experiments.Interface;

public interface IExperimentHub
{
    Task Popup(string message);
    Task ConsoleLog(string line);
    Task UpdateData(string dataName, object value);
    Task OnReset();
    Task GraphAddPoint(List<GraphAddPointDto> updates);
    
    Task CreateGraph(Guid id, string color);
    Task CreateDataView(string label, string parameterName, object initialValue, string suffix);
    Task CreateInputView(string label, string parameterName, object initialValue);
}