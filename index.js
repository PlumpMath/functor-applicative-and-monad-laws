var Immutable = require('immutable');
var bilby     = require('bilby');
var assert    = require('assert');

// Functional helpers
var identity = function(x) { return(x); };
var flip     = bilby.flip;
var curry    = bilby.curry;
var compose  = curry(bilby.compose);
var apply    = curry(function(f, x) { return(f(x)); });
var $        = apply;

// Immutable.js helpers
var equals = curry(function(a, b) { return(Immutable.is(a, b) === true); });

// Other helpers
var inc      = function(x) { return(x + 1); };
var multiply = curry(function(x, y) { return(x * y); });

// Assertion count state
var assertionsCount = 0;
var run = function(f) {
  return(function() {
    assertionsCount++;
    f.apply(null, arguments);
  });
};

// data Maybe a = Nothing | Just a
var Maybe   = {};
var Nothing = {};
var Just    = function(value) { return(Immutable.Map({ value: value })); };

// class Functor f where
//   fmap :: (a -> b) -> f a -> f b
//
// instance Functor Maybe where
//   fmap _ Nothing = Nothing
//   fmap g Just x  = Just (g x)
Maybe.fmap = curry(function(g, maybeV) {
  return(maybeV === Nothing ? Nothing : Just(g(maybeV.get('value'))));
});

console.log('Functor Law #1 (Identity): fmap id = id');
[Nothing, Just(1)].forEach(run(function(x) {
  assert(equals(
    Maybe.fmap(identity, x),
    identity(x)
  ));
}));

console.log('Functor Law #2 (Composition): fmap (f . g) = fmap f . fmap g');
[
  { f: inc, g: multiply(8), x: Nothing },
  { f: inc, g: multiply(8), x: Just(1) }
].forEach(run(function(o) {
  assert(equals(
    Maybe.fmap(compose(o.f, o.g), o.x),
    Maybe.fmap(o.f, Maybe.fmap(o.g, o.x))
  ));
}));

// class (Functor f) => Applicative f where
//   pure  :: a -> f a
//   (<*>) :: f (a -> b) -> f a -> f b
//
// instance Applicative Maybe f where
//   pure                   = Just
//   Nothing  <*> _         = Nothing
//   (Just f) <*> something = fmap f something
Maybe.pure = Just;

Maybe.apply = curry(function(maybeF, maybeV) {
  return(maybeF === Nothing ? Nothing : Maybe.fmap(maybeF.get('value'), maybeV));
});

console.log('Applicative Functor Law #1 (Identity): pure id <*> x = x');
[Nothing, Just(1)].forEach(run(function(x) {
  assert(equals(
    Maybe.apply(Maybe.pure(identity), x),
    x
  ));
}));

console.log('Applicative Functor Law #2 (Homomorphism): pure f <*> pure x = pure (f x)');
[
  { f: inc, x: Nothing },
  { f: inc, x: Just(1) }
].forEach(run(function(o) {
  assert(equals(
    Maybe.apply(Maybe.pure(o.f), Maybe.pure(o.x)),
    Maybe.pure(o.f(o.x))
  ));
}));

console.log('Applicative Functor Law #3 (Interchange): u <*> pure y = pure ($ y) <*> u');
[
  { u: Nothing,   y: 1 },
  { u: Just(inc), y: 1 },
].forEach(run(function(o) {
  assert(equals(
    Maybe.apply(o.u, Maybe.pure(o.y)),
    Maybe.apply(Maybe.pure(flip($)(o.y)), o.u)
  ));
}));

console.log('Applicative Functor Law #4 (Composition): f <*> (g <*> x) = pure (.) <*> f <*> g <*> x');
[
  { f: inc, g: multiply(8), x: Nothing },
  { f: inc, g: multiply(8), x: Just(1) }
].forEach(run(function(o) {
  assert(equals(
    Maybe.apply(Maybe.apply(Maybe.apply(Maybe.pure(compose), Just(o.f)), Just(o.g)), o.x),
    Maybe.apply(Just(o.f), Maybe.apply(Just(o.g), o.x))
  ));
}));

console.log('Applicative Functor Law #5: pure f <*> x = fmap f x');
[
  { f: inc, x: Nothing },
  { f: inc, x: Just(1) }
].forEach(run(function(o) {
  assert(equals(
    Maybe.apply(Maybe.pure(o.f), o.x),
    Maybe.fmap(o.f, o.x)
  ));
}));

// class Monad m where
//   return :: a -> m a
//   >>=    :: m a -> (a -> m b) -> m b
//
// instance Monad Maybe m where
//   return        = pure
//   Nothing >>= _ = Nothing
//   Just x  >>= f = f x
Maybe.return = Maybe.pure;

Maybe.bind = curry(function(maybeV, f) {
  return(maybeV === Nothing ? Nothing : f(maybeV.get('value')));
});

console.log('Monad law #1 (Left Identity): return x >>= f = f x');
[
  { x: 1, f: function(x) { return(Nothing); } },
  { x: 1, f: function(x) { return(Just(inc(x))); } },
].forEach(run(function(o) {
  assert(equals(
    Maybe.bind(Maybe.return(o.x), o.f),
    o.f(o.x)
  ));
}));

console.log('Monad law #2 (Right Identity): m >>= return = m');
[
  { m: Just(1) },
  { m: Nothing },
].forEach(run(function(o) {
  assert(equals(
    Maybe.bind(o.m, Maybe.return),
    o.m
  ));
}));

console.log('Monad law #3 (Associativity): (m >>= f) >>= g = m >>= (\\x -> f x >>= g)');
[
  {
    m: Nothing,
    f: function(x) { return(Nothing); },
    g: function(x) { return(Nothing); }
  },
  {
    m: Nothing,
    f: function(x) { return(Nothing); },
    g: function(x) { return(Just(1)); }
  },
  {
    m: Nothing,
    f: function(x) { return(Just(1)); },
    g: function(x) { return(Nothing); }
  },
  {
    m: Nothing,
    f: function(x) { return(Just(1)); },
    g: function(x) { return(Just(1)); }
  },
  {
    m: Just(1),
    f: function(x) { return(Nothing); },
    g: function(x) { return(Nothing); }
  },
  {
    m: Just(1),
    f: function(x) { return(Nothing); },
    g: function(x) { return(Just(1)); }
  },
  {
    m: Just(1),
    f: function(x) { return(Just(1)); },
    g: function(x) { return(Nothing); }
  },
  {
    m: Just(1),
    f: function(x) { return(Just(1)); },
    g: function(x) { return(Just(1)); }
  }
].forEach(run(function(o) {
  assert(equals(
    Maybe.bind(Maybe.bind(o.m, o.f), o.g),
    Maybe.bind(o.m, function(x) { return(Maybe.bind(o.f(x), o.g)); })
  ));
}));

console.log('\n' + assertionsCount + ' assertions succeeded');
