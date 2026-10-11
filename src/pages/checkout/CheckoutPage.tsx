import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { ApiError, placeOrder } from '@/api/client'
import type { PaymentMethod } from '@/api/types'
import { GiftWrapToggle } from '@/components/BagDrawer'
import { Icon } from '@/components/Icon'
import { Photo } from '@/components/Photo'
import { fragranceBySlug } from '@/data/catalogue'
import { useBag } from '@/hooks/useBag'
import { usePageTitle } from '@/hooks/usePageTitle'
import { computeTotals, DELIVERY, type DeliveryId } from '@/lib/cart'
import { type Address, type Contact, type FieldErrors, hasErrors, validateAddress, validateContact } from '@/lib/checkout'
import { formatNaira } from '@/lib/money'
import { detectBrand, formatCardNumber, formatExpiry, TEST_CARDS, validateCard, type CardErrors, type CardInput } from '@/lib/payment'
import { LAGOS_AREAS, STATES } from '@/lib/places'
import { useCart } from '@/stores/cart'
import { useOrders } from '@/stores/orders'
import styles from './Checkout.module.css'

const BANK = { name: 'Haze Fragrance Studio Ltd', bank: 'Demo Bank', account: '0987654321' }

const optionsFor = (state: string): DeliveryId[] => (!state ? [] : state === 'Lagos' ? ['lagos', 'pickup'] : ['nationwide', 'pickup'])

export default function CheckoutPage() {
  usePageTitle('Checkout')
  const navigate = useNavigate()
  const rawLines = useCart((s) => s.lines)
  const giftWrap = useCart((s) => s.giftWrap)
  const clear = useCart((s) => s.clear)
  const addOrder = useOrders((s) => s.add)
  const ids = useId()

  const [contact, setContact] = useState<Contact>({ name: '', email: '', phone: '' })
  const [address, setAddress] = useState<Address>({ state: '', area: '', street: '', landmark: '' })
  const [delivery, setDelivery] = useState<DeliveryId | null>(null)
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [card, setCard] = useState<CardInput>({ number: '', expiry: '', cvv: '', name: '' })
  const [giftNote, setGiftNote] = useState('')
  const [errors, setErrors] = useState<{ contact: FieldErrors<Contact>; address: FieldErrors<Address>; card: CardErrors; delivery?: string }>({ contact: {}, address: {}, card: {} })
  const [banner, setBanner] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const bannerRef = useRef<HTMLDivElement>(null)

  const { lines, totals, credit } = useBag(delivery)
  const options = optionsFor(address.state)
  const brand = detectBrand(card.number)

  if (!lines.length) {
    return (
      <div className={`wrap ${styles.page}`}>
        <h1 className={`display ${styles.title}`}>Checkout</h1>
        <p className="muted">Your bag is empty.</p>
        <Link to="/shop" className="btn" style={{ marginTop: '1.5rem' }}>
          Back to the shop
        </Link>
      </div>
    )
  }

  const focusFirstError = () => requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-invalid="true"] input')?.focus())
  const showBanner = (m: string) => {
    setBanner(m)
    requestAnimationFrame(() => bannerRef.current?.focus())
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const pickup = delivery === 'pickup'
    const next = {
      contact: validateContact(contact),
      address: validateAddress(address, pickup),
      card: method === 'card' ? validateCard(card) : {},
      delivery: delivery && options.includes(delivery) ? undefined : 'Choose how you’d like it delivered',
    }
    setErrors(next)
    setBanner(null)
    if (hasErrors(next.contact) || hasErrors(next.address) || hasErrors(next.card) || next.delivery) return focusFirstError()

    setSubmitting(true)
    try {
      const order = await placeOrder(
        { lines: rawLines, giftWrap, contact, address, delivery: delivery!, payment: { method, card: method === 'card' ? card : undefined }, credit, giftNote: giftWrap ? giftNote : undefined },
        credit,
      )
      addOrder(order)
      clear()
      void navigate(`/orders/${order.id}?placed=1`, { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.detail.fields) {
          setErrors({ contact: err.detail.fields.contact ?? {}, address: err.detail.fields.address ?? {}, card: err.detail.fields.card ?? {} })
          focusFirstError()
        }
        showBanner(err.detail.message)
      } else showBanner('Something went wrong on our side. You have not been charged.')
    } finally {
      setSubmitting(false)
    }
  }

  const field = (group: 'contact' | 'address', key: string) => {
    const err = (errors[group] as Record<string, string | undefined>)[key]
    return { id: `${ids}-${key}`, 'aria-invalid': !!err, 'aria-describedby': err ? `${ids}-${key}-err` : undefined }
  }
  const errorText = (group: 'contact' | 'address' | 'card', key: string) => {
    const err = (errors[group] as Record<string, string | undefined>)[key]
    return err ? (
      <p className="error" id={`${ids}-${key}-err`}>
        {err}
      </p>
    ) : null
  }
  const cardField = (key: keyof CardInput) => ({ 'aria-invalid': !!errors.card[key], 'aria-describedby': errors.card[key] ? `${ids}-${key}-err` : undefined })

  return (
    <div className={`wrap ${styles.page}`}>
      <h1 className={`display ${styles.title}`}>Checkout</h1>
      <form ref={formRef} className={styles.layout} onSubmit={submit} noValidate>
        <div className={styles.main}>
          {banner && (
            <div ref={bannerRef} tabIndex={-1} className={styles.banner} role="alert">
              <Icon name="alert" size={20} />
              <p>{banner}</p>
            </div>
          )}

          <section className={styles.section} aria-labelledby="s-contact">
            <h2 id="s-contact" className={styles.h2}>
              <span className="num">1</span> Contact
            </h2>
            <div className={styles.grid2}>
              <div className={`field ${styles.full}`}>
                <label htmlFor={`${ids}-name`}>Full name</label>
                <input className="input" autoComplete="name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} {...field('contact', 'name')} />
                {errorText('contact', 'name')}
              </div>
              <div className="field">
                <label htmlFor={`${ids}-email`}>Email</label>
                <input className="input" type="email" autoComplete="email" inputMode="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} {...field('contact', 'email')} />
                {errorText('contact', 'email')}
              </div>
              <div className="field">
                <label htmlFor={`${ids}-phone`}>Phone</label>
                <input className="input" type="tel" autoComplete="tel" inputMode="tel" placeholder="0803 123 4567" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} {...field('contact', 'phone')} />
                {errorText('contact', 'phone')}
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="s-delivery">
            <h2 id="s-delivery" className={styles.h2}>
              <span className="num">2</span> Delivery
            </h2>
            <div className={styles.grid2}>
              <div className="field">
                <label htmlFor={`${ids}-state`}>State</label>
                <select
                  className="input"
                  autoComplete="address-level1"
                  value={address.state}
                  onChange={(e) => {
                    setAddress({ ...address, state: e.target.value, area: '' })
                    setDelivery(null)
                  }}
                  {...field('address', 'state')}
                >
                  <option value="" disabled>
                    Choose a state
                  </option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {errorText('address', 'state')}
              </div>
              {delivery !== 'pickup' && (
                <>
                  <div className="field">
                    <label htmlFor={`${ids}-area`}>{address.state === 'Lagos' ? 'Area' : 'Town or city'}</label>
                    {address.state === 'Lagos' ? (
                      <select className="input" value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} {...field('address', 'area')}>
                        <option value="" disabled>
                          Choose your area
                        </option>
                        {LAGOS_AREAS.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    ) : (
                      <input className="input" autoComplete="address-level2" value={address.area} onChange={(e) => setAddress({ ...address, area: e.target.value })} {...field('address', 'area')} />
                    )}
                    {errorText('address', 'area')}
                  </div>
                  <div className={`field ${styles.full}`}>
                    <label htmlFor={`${ids}-street`}>House number and street</label>
                    <input className="input" autoComplete="street-address" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} {...field('address', 'street')} />
                    {errorText('address', 'street')}
                  </div>
                  <div className={`field ${styles.full}`}>
                    <label htmlFor={`${ids}-landmark`}>
                      Nearest landmark <span className="muted">(optional)</span>
                    </label>
                    <input id={`${ids}-landmark`} className="input" value={address.landmark} onChange={(e) => setAddress({ ...address, landmark: e.target.value })} />
                  </div>
                </>
              )}
            </div>

            <fieldset className={styles.options} data-invalid={!!errors.delivery} aria-describedby={errors.delivery ? `${ids}-delivery-err` : undefined}>
              <legend className="label">How should we get it to you?</legend>
              {options.length === 0 ? (
                <p className="hint">Choose a state to see delivery options.</p>
              ) : (
                options.map((id) => {
                  const o = DELIVERY[id]
                  const fee = computeTotals(lines, { delivery: id, giftWrap, credit }).delivery
                  return (
                    <label key={id} className={styles.option}>
                      <input type="radio" name="delivery" checked={delivery === id} onChange={() => setDelivery(id)} />
                      <span className={styles.optionText}>
                        <strong>{o.label}</strong>
                        <span className="muted">
                          {o.eta}
                          {o.freeOver > 0 && `, free over ${formatNaira(o.freeOver)}`}
                        </span>
                      </span>
                      <span className="num">{fee === 0 ? 'Free' : formatNaira(fee)}</span>
                    </label>
                  )
                })
              )}
              {errors.delivery && (
                <p className="error" id={`${ids}-delivery-err`}>
                  {errors.delivery}
                </p>
              )}
            </fieldset>

            <div className={styles.gift}>
              <GiftWrapToggle />
              {giftWrap && (
                <div className="field">
                  <label htmlFor={`${ids}-note`}>
                    Card message <span className="muted">(optional)</span>
                  </label>
                  <textarea id={`${ids}-note`} className="input" rows={3} maxLength={200} value={giftNote} onChange={(e) => setGiftNote(e.target.value)} />
                  <p className="hint">{200 - giftNote.length} characters left. We write it by hand.</p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.section} aria-labelledby="s-pay">
            <h2 id="s-pay" className={styles.h2}>
              <span className="num">3</span> Payment
            </h2>
            <div className={styles.methods} role="radiogroup" aria-label="Payment method">
              {(
                [
                  ['card', 'Card'],
                  ['transfer', 'Bank transfer'],
                ] as const
              ).map(([id, label]) => (
                <label key={id} className={styles.method}>
                  <input type="radio" name="method" checked={method === id} onChange={() => setMethod(id)} />
                  {label}
                </label>
              ))}
            </div>

            {method === 'card' ? (
              <div className={styles.card}>
                <div className={styles.testCards}>
                  <span className="hint">Demo cards:</span>
                  <button type="button" className="link-btn" onClick={() => setCard({ number: TEST_CARDS.success, expiry: '12/29', cvv: '123', name: contact.name || 'Ada Obi' })}>
                    one that works
                  </button>
                  <button type="button" className="link-btn" onClick={() => setCard({ number: TEST_CARDS.declined, expiry: '12/29', cvv: '123', name: contact.name || 'Ada Obi' })}>
                    one that’s declined
                  </button>
                </div>
                <div className={styles.grid2}>
                  <div className={`field ${styles.full}`}>
                    <label htmlFor={`${ids}-card`}>Card number</label>
                    <div className={styles.cardInput}>
                      <input id={`${ids}-card`} className="input num" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={card.number} onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })} {...cardField('number')} />
                      {brand !== 'unknown' && <span className={styles.brandTag}>{brand}</span>}
                    </div>
                    {errorText('card', 'number')}
                  </div>
                  <div className="field">
                    <label htmlFor={`${ids}-exp`}>Expiry</label>
                    <input id={`${ids}-exp`} className="input num" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} {...cardField('expiry')} />
                    {errorText('card', 'expiry')}
                  </div>
                  <div className="field">
                    <label htmlFor={`${ids}-cvv`}>CVV</label>
                    <input id={`${ids}-cvv`} className="input num" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '') })} {...cardField('cvv')} />
                    {errorText('card', 'cvv')}
                  </div>
                  <div className={`field ${styles.full}`}>
                    <label htmlFor={`${ids}-cname`}>Name on card</label>
                    <input id={`${ids}-cname`} className="input" autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} {...cardField('name')} />
                    {errorText('card', 'name')}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.transfer}>
                <p>Place the order, then send {formatNaira(totals.total)} to:</p>
                <dl>
                  <div>
                    <dt>Account name</dt>
                    <dd>{BANK.name}</dd>
                  </div>
                  <div>
                    <dt>Bank</dt>
                    <dd>{BANK.bank}</dd>
                  </div>
                  <div>
                    <dt>Account number</dt>
                    <dd className="num">{BANK.account}</dd>
                  </div>
                </dl>
                <p className="hint">Use your order number as the reference.</p>
              </div>
            )}
          </section>
        </div>

        <aside className={styles.summary} aria-labelledby="s-summary">
          <h2 id="s-summary" className={styles.h2}>
            Your order
          </h2>
          <ul role="list" className={styles.items}>
            {lines.map((l) => (
              <li key={l.key}>
                <span className={styles.thumb}>
                  <Photo name={l.type === 'box' ? 'b-vials' : l.product.photos[0]!} alt="" sizes="56px" ratio={1} />
                  <span className={`${styles.qty} num`}>{l.type === 'box' ? 1 : l.qty}</span>
                </span>
                <span>
                  <strong>{l.type === 'box' ? 'Discovery box' : l.product.name}</strong>
                  <span className="muted">
                    {l.type === 'box' ? l.slugs.map((s) => fragranceBySlug(s)!.name).join(', ') : [l.size.label, l.engraving && `“${l.engraving}”`].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="num">{formatNaira(l.total)}</span>
              </li>
            ))}
          </ul>

          <dl className={styles.rows}>
            <div>
              <dt>Items</dt>
              <dd className="num">{formatNaira(totals.merchandise)}</dd>
            </div>
            {totals.credit > 0 && (
              <div className={styles.credit}>
                <dt>Sample box credit</dt>
                <dd className="num">−{formatNaira(totals.credit)}</dd>
              </div>
            )}
            {totals.giftWrap > 0 && (
              <div>
                <dt>Gift wrap</dt>
                <dd className="num">{formatNaira(totals.giftWrap)}</dd>
              </div>
            )}
            <div>
              <dt>Delivery</dt>
              <dd className="num">{delivery ? (totals.delivery ? formatNaira(totals.delivery) : 'Free') : '—'}</dd>
            </div>
            <div className={styles.total}>
              <dt>Total</dt>
              <dd className="num">{formatNaira(totals.total)}</dd>
            </div>
          </dl>
          {credit > 0 && totals.credit === 0 && <p className="hint">Your {formatNaira(credit)} sample credit applies to full-size perfume, not boxes or candles.</p>}
          <button type="submit" className="btn btn-ember btn-block" disabled={submitting} aria-busy={submitting}>
            {submitting ? 'Placing your order…' : method === 'card' ? `Pay ${formatNaira(totals.total)}` : 'Place order'}
          </button>
          <p className="hint">This is a demo shop. No money moves and nothing will be delivered.</p>
        </aside>
      </form>
    </div>
  )
}
