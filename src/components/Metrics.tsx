import { metrics as staticMetrics, type Metric } from '../data/content';
import { useCountUp } from '../lib/useCountUp';
import { useHomeContent } from '../cms/CmsProvider';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const { ref, current } = useCountUp(Number(metric.value) || 0);
  const decimals = metric.decimals ?? 0;

  return (
    <Reveal className="metric" delay={index}>
      <strong>
        <span ref={ref}>
          {current.toFixed(decimals)}
          {metric.suffix}
        </span>
      </strong>
      <span>{metric.label}</span>
    </Reveal>
  );
}

export function Metrics() {
  const home = useHomeContent();
  const metrics = (home?.metrics?.length ? home.metrics : staticMetrics) as Metric[];
  const sectionCopy = home?.metricsSection || {};

  return (
    <section className="section metrics" id="metrics">
      <div className="container">
        <SectionHead
          eyebrow={sectionCopy.eyebrow || 'Proven impact'}
          title={sectionCopy.title || 'What changes in the *first quarter*'}
          style={{ marginBottom: 0 }}
        />

        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <MetricCard key={`${metric.label}-${index}`} metric={metric} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
