import { Link } from 'react-router'
import { fragranceBySlug, productBySlug } from '@/data/catalogue'
import { useBag } from '@/hooks/useBag'
import { GIFT_WRAP_PRICE, MAX_QTY } from '@/lib/cart'
import { formatNaira } from '@/lib/money'
import { useBox } from '@/stores/box'
import { useCart } from '@/stores/cart'
import { useUi } from '@/stores/ui'
import { Dialog } from './Dialog'
import { Photo } from './Photo'
import { QuantityStepper } from './QuantityStepper'
import styles from './BagDrawer.module.css'

export function BagLines({ compact = false, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const { lines } = useBag()
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)

  // undo lives inline: the drawer is a modal dialog, so a toast behind it can't be clicked
  const removeLine = (key: string) => remove(key)

  return (
    <ul role="list" className={styles.lines} data-compact={compact}>
      {lines.map((l) =>
        l.type === 'box' ? (
          <li key={l.key} className={styles.line}>
            <span className={styles.thumb}>
              <Photo name="b-vials" alt="" sizes="96px" ratio={4 / 5} />
            </span>
            <div className={styles.info}>
              <p className={styles.kind}>Five 2 ml vials</p>
              <p className={styles.name}>Discovery box</p>
              <p className={styles.meta}>{l.slugs.map((s) => fragranceBySlug(s)!.name).join(' · ')}</p>
              <div className={styles.row}>
                <button type="button" className={styles.remove} onClick={() => removeLine(l.key)}>
                  Remove<span className="sr-only"> discovery box</span>
                </button>
              </div>
            </div>
            <p className={`${styles.price} num`}>{formatNaira(l.total)}</p>
          </li>
        ) : (
          <li key={l.key} className={styles.line}>
            <Link to={`/shop/${l.product.slug}`} className={styles.thumb} tabIndex={-1} aria-hidden onClick={onNavigate}>
              <Photo name={l.product.photos[0]!} alt="" sizes="96px" ratio={4 / 5} />
            </Link>
            <div className={styles.info}>
              <p className={styles.kind}>{l.product.kind === 'fragrance' ? 'Eau de parfum' : 'Candle'}</p>
              <Link to={`/shop/${l.product.slug}`} className={styles.name} onClick={onNavigate}>
                {l.product.name}
              </Link>
              <p className={styles.meta}>
                {l.size.label}
                {l.engraving && <> · engraved “{l.engraving}”</>}
              </p>
              {l.qty > l.available && <p className="error">{l.available === 0 ? 'Sold out in this size' : `Only ${l.available} left`}</p>}
              <div className={styles.row}>
                <QuantityStepper size="sm" value={l.qty} max={Math.min(MAX_QTY, Math.max(1, l.available))} onChange={(n) => setQty(l.key, n)} label={`Quantity of ${l.product.name}`} />
                <button type="button" className={styles.remove} onClick={() => removeLine(l.key)}>
                  Remove<span className="sr-only"> {l.product.name}</span>
                </button>
              </div>
            </div>
            <p className={`${styles.price} num`}>{formatNaira(l.total)}</p>
          </li>
        ),
      )}
    </ul>
  )
}

export function UndoRemove() {
  const removed = useCart((s) => s.removed)
  const restore = useCart((s) => s.restore)
  if (!removed) return null
  const l = removed.line
  const name = l.type === 'box' ? 'Discovery box' : (productBySlug(l.slug)?.name ?? 'Item')
  return (
    <p className={styles.undo} role="status">
      <span>Removed {name}</span>
      <button type="button" className="link-btn" onClick={() => restore(removed.line, removed.index)}>
        Undo
      </button>
    </p>
  )
}

export function GiftWrapToggle() {
  const giftWrap = useCart((s) => s.giftWrap)
  const set = useCart((s) => s.setGiftWrap)
  return (
    <label className={styles.wrap}>
      <input type="checkbox" checked={giftWrap} onChange={(e) => set(e.target.checked)} />
      <span>
        <strong>Wrap it as a gift</strong>
        <span className="hint">Smoke-grey paper, wax seal and a handwritten card. {formatNaira(GIFT_WRAP_PRICE)}</span>
      </span>
    </label>
  )
}

export function BagDrawer() {
  const open = useUi((s) => s.bagOpen)
  const close = useUi((s) => s.closeBag)
  const { lines, totals, credit } = useBag()
  const draft = useBox((s) => s.slugs.length)

  return (
    <Dialog
      open={open}
      onClose={close}
      title={lines.length ? `Your bag (${totals.items})` : 'Your bag'}
      placement="right"
      footer={
        lines.length ? (
          <div className={styles.foot}>
            {totals.credit > 0 && (
              <p className={styles.sum}>
                <span>Sample box credit</span>
                <span className="num">−{formatNaira(totals.credit)}</span>
              </p>
            )}
            {totals.giftWrap > 0 && (
              <p className={styles.sum}>
                <span>Gift wrap</span>
                <span className="num">{formatNaira(totals.giftWrap)}</span>
              </p>
            )}
            <p className={`${styles.sum} ${styles.total}`}>
              <span>Subtotal</span>
              <span className="num">{formatNaira(totals.total)}</span>
            </p>
            <p className="hint">Delivery is worked out at checkout.</p>
            <Link to="/checkout" className="btn btn-ember btn-block" onClick={close}>
              Checkout
            </Link>
          </div>
        ) : undefined
      }
    >
      {lines.length ? (
        <div className={styles.body}>
          {credit > 0 && totals.credit === 0 && (
            <p className={styles.note}>
              You have <strong className="num">{formatNaira(credit)}</strong> sample box credit. It comes off your next full-size bottle.
            </p>
          )}
          <UndoRemove />
          <BagLines compact onNavigate={close} />
          <GiftWrapToggle />
          {draft > 0 && draft < 5 && (
            <p className={styles.note}>
              Your sample box has {draft} of 5 vials. <Link to="/box" onClick={close}>Finish it</Link>
            </p>
          )}
        </div>
      ) : (
        <div className={styles.empty}>
          <UndoRemove />
          <p className="display">Nothing here yet.</p>
          <p className="muted">Not sure what you like? Five vials cost {formatNaira(18000)}, and that comes back as credit on a full bottle.</p>
          <Link to="/box" className="btn" onClick={close}>
            Build a sample box
          </Link>
          <Link to="/quiz" className="btn btn-ghost" onClick={close}>
            Take the scent quiz
          </Link>
        </div>
      )}
    </Dialog>
  )
}
