import { useEffect, useRef, type KeyboardEvent } from 'react';
import { products as staticProducts, type Product } from '../data/content';
import { useAutoRotate } from '../lib/useAutoRotate';
import { useHomeContent } from '../cms/CmsProvider';
import { Icon } from './Icon';
import { ProductMock } from './ProductMock';
import { Reveal } from './Reveal';
import { SectionHead } from './SectionHead';

export function Products() {
  const home = useHomeContent();
  const products = (home?.products?.length ? home.products : staticProducts) as Product[];
  const sectionCopy = home?.productsSection || {};
  const rotate = useAutoRotate<HTMLDivElement>(products.length, 2000);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabListRef = useRef<HTMLDivElement>(null);
  const safeIndex = Math.min(rotate.index, Math.max(0, products.length - 1));
  const product = products[safeIndex];

  useEffect(() => {
    const list = tabListRef.current;
    const tab = tabRefs.current[safeIndex];
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }, [safeIndex]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = products.length - 1;
    let next = -1;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = safeIndex === last ? 0 : safeIndex + 1;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = safeIndex === 0 ? last : safeIndex - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next < 0) return;

    event.preventDefault();
    rotate.select(next);
    tabRefs.current[next]?.focus();
  };

  if (!product) return null;

  return (
    <section className="section section--light" id="products">
      <div className="container">
        <SectionHead
          title={sectionCopy.title || 'Everything between requisition and *offer letter*'}
          body={
            sectionCopy.body ||
            'Most teams stitch together five tools to move a candidate from "applied" to "signed." TalentPool365 runs the whole workflow — with the evidence trail to back every decision.'
          }
        />

        <Reveal className="showcase">
          <div className="showcase-inner" ref={rotate.ref} {...rotate.holdProps}>
            <div className="showcase-side">
              <div
                className="showcase-tabs"
                ref={tabListRef}
                role="tablist"
                aria-label="Products"
                aria-orientation="vertical"
                onKeyDown={onKeyDown}
              >
                {products.map((item, i) => {
                  const selected = i === safeIndex;
                  return (
                    <button
                      key={`${item.title}-${i}`}
                      ref={(node) => {
                        tabRefs.current[i] = node;
                      }}
                      type="button"
                      role="tab"
                      id={`product-tab-${i}`}
                      className="showcase-tab"
                      aria-selected={selected}
                      aria-controls="product-panel"
                      tabIndex={selected ? 0 : -1}
                      onClick={() => rotate.select(i)}
                    >
                      <span className="icon-tile">
                        <Icon name={item.icon || 'layers'} />
                      </span>
                      {item.title}
                      {selected ? (
                        <span
                          className={`showcase-progress${rotate.running ? ' is-running' : ''}`}
                          key={`${i}-${rotate.running}`}
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {rotate.canAutoPlay ? (
                <button className="auto-toggle auto-toggle--text" type="button" onClick={rotate.togglePaused}>
                  <Icon name={rotate.paused ? 'play' : 'pause'} />
                  {rotate.paused ? 'Play product tour' : 'Pause product tour'}
                </button>
              ) : null}
            </div>

            <div
              className="showcase-panel"
              role="tabpanel"
              id="product-panel"
              aria-labelledby={`product-tab-${safeIndex}`}
              tabIndex={0}
            >
              <div className="showcase-stage" key={safeIndex}>
                <ProductMock index={safeIndex} title={product.title} />
              </div>
              <div className="showcase-copy" key={`copy-${safeIndex}`}>
                <h3>{product.title}</h3>
                <p>{product.body}</p>
                <ul className="ticks">
                  {(product.points || []).map((point, idx) => (
                    <li key={`${point}-${idx}`}>{point}</li>
                  ))}
                </ul>
                <a className="more-link" href={product.href || '/products'}>
                  Explore {product.title}
                  <Icon name="arrow-right" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
