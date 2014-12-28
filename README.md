# functor-applicative-and-monad-laws

## Dependencies

- git
- Node.js
- npm

## Running it
```Bash
git clone https://github.com/mpereira/functor-applicative-and-monad-laws.git
cd functor-applicative-and-monad-laws
npm install
node index.js
```

### Output
```
Functor Law #1 (Identity): fmap id = id
Functor Law #2 (Composition): fmap (f . g) = fmap f . fmap g
Applicative Functor Law #1 (Identity): pure id <*> x = x
Applicative Functor Law #2 (Homomorphism): pure f <*> pure x = pure (f x)
Applicative Functor Law #3 (Interchange): u <*> pure y = pure ($ y) <*> u
Applicative Functor Law #4 (Composition): f <*> (g <*> x) = pure (.) <*> f <*> g <*> x
Applicative Functor Law #5: pure f <*> x = fmap f x
Monad law #1 (Left Identity): return x >>= f = f x
Monad law #2 (Right Identity): m >>= return = m
Monad law #3 (Associativity): (m >>= f) >>= g = m >>= (\x -> f x >>= g)

26 assertions succeeded
```
