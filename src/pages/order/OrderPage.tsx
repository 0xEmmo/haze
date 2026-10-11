import { Link, useParams, useSearchParams } from 'react-router'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { usePageTitle } from '@/hooks/usePageTitle'
import { BOX_CREDIT_DAYS } from '@/lib/box'
import { DELIVERY } from '@/lib/cart'
import { formatNaira } from '@/lib/money'
import { useOrders } from '@/stores/orders'
import styles from './Order.module.css'

const fmt = (d: Date) => d.toLocaleString('en-NG', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Lagos' })

export default function OrderPage() {
  const { id = '' } = useParams()
  const placed = useSearchParams()[0].get('placed') === '1'
  const order = useOrders((s) => s.orders.find((o) => o.id === id))
  const others = useOrders((s) => s.orders.filter((o) => o.id !== id))
  usePageTitle(order ? `Order ${order.id}` : 'Order not found')

  if (!order) {
    return (
      <div className={`wrap ${styles.page}`}>
        <h1 className={`display ${styles.title}`}>Order not found</h1>
        <p className="muted">We couldn’t find {id} on this device. Orders are kept in the browser you placed them from.</p>
        <Link to="/shop" className="btn" style={{ marginTop: '1.5rem' }}>
          Back to the shop
        </Link>
      </div>
    )
  }

  const at = new Date(order.placedAt)
  const pickup = order.delivery === 'pickup'
  const steps = [
    { label: 'Order placed', when: at, done: true },
    { label: order.payment.method === 'transfer' ? 'Transfer received' : 'Payment confirmed', when: at, done: order.payment.method === 'card' },
    { label: 'Hand-checked and wrapped at the studio', when: new Date(at.getTime() + 3 * 3600e3), done: false },
    { label: pickup ? 'Ready to collect in Ikoyi' : 'With the rider', when: new Date(at.getTime() + (pickup ? 2 : 22) * 3600e3), done: false },
  ]
  const current = steps.findIndex((s) => !s.done)

  return (
    <div className={`wrap ${styles.page}`}>
      {placed && (
        <div className={styles.thanks} role="status">
          <Icon name="check" size={22} />
          <div>
            <p className={styles.thanksTitle}>Thank you, {order.contact.name.trim().split(/\s+/)[0]}. It’s ours to look after now.</p>
            <p>A receipt is on its way to {order.contact.email}.</p>
          </div>
        </div>
      )}
      <p className="eyebrow">Order</p>
      <h1 className={`display num ${styles.title}`}>{order.id}</h1>
      <p className="muted">Placed {fmt(at)}</p>

      {order.boxCredit > 0 && (
        <p className={styles.creditNote}>
          <Icon name="vial" size={20} />
          <span>
            You’ve earned <strong className="num">{formatNaira(order.boxCredit)}</strong> credit. It comes off your next full-size bottle
            automatically, for {BOX_CREDIT_DAYS} days.
          </span>
        </p>
      )}

      <div className={styles.detail}>
        <section aria-labelledby="track-title" className={styles.card}>
          <h2 id="track-title" className={styles.h2}>
            What happens next
          </h2>
          <ol className={styles.timeline}>
            {steps.map((s, i) => {
              const state = s.done ? 'done' : i === current ? 'current' : 'todo'
              return (
                <li key={s.label} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
                  <span className={styles.dot} aria-hidden="true">
                    {state === 'done' && <Icon name="check" size={12} />}
                  </span>
                  <span>
                    <strong>{s.label}</strong>
                    <span className="muted">{s.done ? fmt(s.when) : `Around ${fmt(s.when)}`}</span>
                  </span>
                </li>
              )
            })}
          </ol>
        </section>

        <section aria-labelledby="where-title" className={styles.card}>
          <h2 id="where-title" className={styles.h2}>
            {pickup ? 'Collection' : 'Delivery'}
          </h2>
          <dl className={styles.facts}>
            <div>
              <dt>{pickup ? 'From' : 'To'}</dt>
              <dd>
                {pickup ? (
                  '14 Bourdillon Road, Ikoyi'
                ) : (
                  <>
                    {order.address.street}, {order.address.area}, {order.address.state}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Method</dt>
              <dd>
                {DELIVERY[order.delivery].label}, {DELIVERY[order.delivery].eta.toLowerCase()}
              </dd>
            </div>
            <div>
              <dt>Paid by</dt>
              <dd>{order.payment.method === 'card' ? `Card ending ${order.payment.last4}` : 'Bank transfer (awaiting)'}</dd>
            </div>
            {order.giftNote && (
              <div>
                <dt>Card reads</dt>
                <dd>“{order.giftNote}”</dd>
              </div>
            )}
          </dl>
        </section>

        <section aria-labelledby="items-title" className={styles.card}>
          <h2 id="items-title" className={styles.h2}>
            In the parcel
          </h2>
          <ul role="list" className={styles.items}>
            {order.lines.map((l) => (
              <li key={l.key}>
                <Photo name={l.photo} alt="" sizes="56px" ratio={1} />
                <span>
                  <strong>
                    {l.qty > 1 && <span className="num">{l.qty} × </span>}
                    {l.title}
                  </strong>
                  <span className="muted">{l.detail}</span>
                </span>
                <span className="num">{formatNaira(l.total)}</span>
              </li>
            ))}
          </ul>
          <dl className={styles.rows}>
            <div>
              <dt>Items</dt>
              <dd className="num">{formatNaira(order.totals.merchandise)}</dd>
            </div>
            {order.totals.credit > 0 && (
              <div>
                <dt>Sample box credit</dt>
                <dd className="num">−{formatNaira(order.totals.credit)}</dd>
              </div>
            )}
            {order.totals.giftWrap > 0 && (
              <div>
                <dt>Gift wrap</dt>
                <dd className="num">{formatNaira(order.totals.giftWrap)}</dd>
              </div>
            )}
            <div>
              <dt>Delivery</dt>
              <dd className="num">{order.totals.delivery ? formatNaira(order.totals.delivery) : 'Free'}</dd>
            </div>
            <div className={styles.total}>
              <dt>Total</dt>
              <dd className="num">{formatNaira(order.totals.total)}</dd>
            </div>
          </dl>
        </section>
      </div>

      {others.length > 0 && (
        <section style={{ marginTop: 'var(--space-7)' }} aria-labelledby="earlier">
          <h2 id="earlier" className="eyebrow">
            Earlier orders
          </h2>
          <ul role="list" style={{ display: 'grid', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            {others.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="num">
                  {o.id}
                </Link>{' '}
                <span className="muted">
                  · {fmt(new Date(o.placedAt))} · {formatNaira(o.totals.total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
