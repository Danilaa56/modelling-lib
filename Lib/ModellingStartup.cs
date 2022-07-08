using Modelling.Lib.Experiments;
using Modelling.Lib.Experiments.Interface;

namespace Modelling.Lib;

public static class ModellingStartup
{
    private static Func<IServiceProvider, Experiment> _factory = null!;

    public static void Start(Func<IServiceProvider, Experiment> factory, string[] args)
    {
        _factory = factory;
        Host.CreateDefaultBuilder(args)
            .ConfigureHostConfiguration(configBuilder => {
                configBuilder.AddCommandLine(new[] {"launchBrowser", "true"});
            })
            .ConfigureWebHostDefaults(builder => builder.UseStartup<Startup>())
            .Build()
            .Run();
    }

    private class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
            services.AddSingleton(provider => new ExperimentHostedService(
                provider.GetRequiredService<IServiceScopeFactory>(),
                _factory
            ));
            services.AddHostedService(provider => provider.GetRequiredService<ExperimentHostedService>());
        }

        public void Configure(IApplicationBuilder app)
        {
            app.UseDefaultFiles();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints => {
                endpoints.MapHub<ExperimentHub>("/hub");
            });
        }
    }
}