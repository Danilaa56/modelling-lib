namespace Modelling.Lib.Experiments.Interface;

public class ExperimentHostedService : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly Func<IServiceProvider, Experiment> _experimentFactory;
    private IServiceScope _scope = null!;

    public ExperimentHostedService(IServiceScopeFactory scopeFactory, Func<IServiceProvider, Experiment> experimentFactory)
    {
        _scopeFactory = scopeFactory;
        _experimentFactory = experimentFactory;
    }

    public Experiment Experiment { get; private set; } = null!;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _scope = _scopeFactory.CreateScope();
        
        Experiment = _experimentFactory.Invoke(_scope.ServiceProvider);
        Experiment.Start();

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        Experiment.Stop();
        _scope.Dispose();
        return Task.CompletedTask;
    }
}