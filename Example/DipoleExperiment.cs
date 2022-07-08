using System.Numerics;
using Modelling.Lib.Experiments;
using Modelling.Lib.Experiments.Data;
using static System.Math;
using static System.Numerics.Complex;

// ReSharper disable FieldCanBeMadeReadOnly.Local

// ReSharper disable MemberCanBePrivate.Global
// ReSharper disable FieldCanBeMadeReadOnly.Global
// ReSharper disable ConvertToConstant.Global
// ReSharper disable InconsistentNaming

namespace Modelling.Example;

public class DipoleExperiment : Experiment
{
    [Input("Prob нахождения в верхнем состоянии")]
    public double P01 = 1;

    [Input("Prob нахождения в нижнем состоянии")]
    public double P02 = 0;

    [Input("dt, с")]
    public double dt = 0.000001;

    [Input("Частота Раби")]
    public double OmegaR = 1;

    [Input("delta")]
    public double delta = 0;

    [Input("gamma")]
    public double gamma = 0;

    [Data("P1(t)")]
    public double P1;

    [Data("P2(t)")]
    public double P2;

    [Data("Время", " с")]
    public double t;

    private Complex i = ImaginaryOne;
    private Complex c1;
    private Complex c2;

    public DipoleExperiment(IServiceProvider serviceProvider) :
        base(serviceProvider)
    {
        InitGraph(() => (t, P1), "#ff77ff");
        InitGraph(() => (t, P2), "#7777ff");
    }

    protected override bool IsInputValid(out List<string>? reasons)
    {
        if (!(dt <= 0)) return base.IsInputValid(out reasons);
        reasons = new List<string> {"Dt must be positive"};

        return false;
    }

    protected override void OnIter()
    {
        t += dt;

        var dc_1 = -OmegaR * c2 * Exp(0, t * delta) / i - c1 * gamma / 2;
        var dc_2 = -OmegaR * c1 * Exp(0, -t * delta) / i - c2 * gamma / 2;

        c1 += dc_1 * dt;
        c2 += dc_2 * dt;

        P1 = Sqr(c1.Magnitude);
        P2 = Sqr(c2.Magnitude);
    }

    protected override void OnReset()
    {
        c1 = new Complex(Sqrt(P01), 0);
        c2 = new Complex(Sqrt(P02), 0);
        P1 = P01;
        P2 = P02;
        t = 0;
    }

    private static Complex Exp(double real, double imaginary)
    {
        return Complex.Exp(new Complex(real, imaginary));
    }

    private static double Sqr(double v)
    {
        return v * v;
    }
}