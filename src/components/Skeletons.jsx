import './Skeletons.css';

export function Skeleton({ className = '', style }) {
  return <span className={`skel ${className}`} style={style} aria-hidden="true" />;
}

function SkelLine({ w = '100%', h }) {
  return <span className="skel skel-line" style={{ width: w, height: h }} aria-hidden="true" />;
}

export function SkeletonProductCard() {
  return (
    <div className="skel-card">
      <Skeleton className="skel-card-media" />
      <div className="skel-card-body">
        <SkelLine w="85%" />
        <SkelLine w="55%" />
        <div className="skel-row">
          <SkelLine w="42%" h={18} />
          <SkelLine w="20%" h={10} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="skel-grid" role="status" aria-label="Loading products">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="pd-page" role="status" aria-label="Loading product">
      <div className="container">
        <div className="skel-breadcrumb" aria-hidden="true">
          <SkelLine w={120} h={11} />
        </div>
        <div className="skel-detail">
          <div className="skel-detail-left">
            <Skeleton className="skel-detail-image" />
            <div className="skel-thumbs">
              {[0, 1, 2, 3].map(i => (
                <Skeleton key={i} className="skel-thumb" />
              ))}
            </div>
          </div>
          <div className="skel-detail-right">
            <SkelLine w="30%" h={12} />
            <SkelLine w="80%" h={22} />
            <SkelLine w="45%" h={12} />
            <div className="skel-row" style={{ marginTop: 6 }}>
              <SkelLine w={130} h={30} />
              <SkelLine w={70} h={14} />
            </div>
            <Skeleton className="skel-offer" />
            <SkelLine w="95%" />
            <SkelLine w="70%" />
            <div className="skel-actions" style={{ marginTop: 'auto' }}>
              <Skeleton className="skel-btn" />
              <Skeleton className="skel-btn skel-btn--alt" />
            </div>
            <div className="skel-services">
              {[0, 1, 2].map(i => (
                <Skeleton key={i} className="skel-service-box" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
